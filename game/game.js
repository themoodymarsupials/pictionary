//imports
import '../auth/user.js';
import {
    getGame,
    createGuess,
    getWords,
    onGuess,
    getGuess,
    updateGame,
    onGameUpdate,
    getGuesses,
    getUser,
    getProfile,
    updateProfile,
} from '../fetch-utils.js';
import { renderGuess } from '../render-utils.js';
import { disableDrawingMode, resetCanvas } from './canvas.js';

//DOM
const errorDisplay = document.getElementById('error-display');
const gameTitle = document.getElementById('game-title');
const gameImage = document.getElementById('game-image');
const addGuessForm = document.getElementById('add-guess-form');
const guessList = document.getElementById('guess-list');
const timer = document.getElementById('timer');
const randomWord = document.getElementById('random-word');
const gameInfo = document.getElementById('game-info');
const startGameButton = document.getElementById('start-game');

//state
let words = [];
let guesses = [];
let guessCur = null;
let game = null;
let timeObj = null;
let error = { message: '' };
let userId = null;
let userProfile = null;

// inprogress: timer running, people can draw, people can guess
// not inprogress: timer not running. people cannot draw. people cannot guess. If there is a winner in the database, display the winner.

// events
window.addEventListener('load', async () => {
    // get gameID
    const searchParams = new URLSearchParams(location.search);
    const gameId = searchParams.get('id');
    if (!gameId) {
        location.replace('/');
        return;
    }

    //get User, profile, game, word, guesses from database
    const userResponse = await getUser();
    handleResponse(userResponse, 'userId');
    const userProfileResponse = await getProfile(userId);
    handleResponse(userProfileResponse, 'userProfile');
    const gameResponse = await getGame(gameId);
    handleResponse(gameResponse, 'gameUpdate');
    const wordsResponse = await getWords();
    handleResponse(wordsResponse, 'words');
    const guessesGetResponse = await getGuesses(gameId);
    handleResponse(guessesGetResponse, 'guessesGet');

    // If NO game -> exit
    if (!game) {
        location.replace('/');
    } else {
        displayGame();
        continueGame();
        displayGuesses();
    }

    // execute on all game updates
    onGameUpdate(game.id, async (payload) => {
        const prevGameState = payload.old;
        game = payload.new;
        // Game was stopped, update -> start game
        if (prevGameState.game_in_progress === false && game.game_in_progress === true) {
            await startGameReceive();
        }
        // Game was in progress, update -> stop game
        else if (prevGameState.game_in_progress === true && game.game_in_progress === false) {
            await stopGameReceive();
        }
    });

    // execute on all guess updates
    onGuess(game.id, async (payload) => {
        const guessId = payload.new.id;
        const guessGetResponse = await getGuess(guessId);
        handleResponse(guessGetResponse, 'guessGet');
        displayGuesses();
    });
});

startGameButton.addEventListener('click', async () => {
    // check if game is in progress -> deactivate button
    if (game.game_in_progress === true) {
        displayStartBtn('stopped');
        return;
    }

    // Update profile
    userProfile.is_drawer = true;
    const profileUpdateResponse = await updateProfile(userProfile);
    handleResponse(profileUpdateResponse, 'updateProfile');

    // Start game
    await startGameSend();
});

addGuessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (userProfile.is_drawer) {
        return;
    }
    const formData = new FormData(addGuessForm);
    guessCur = formData.get('guess').toLowerCase();
    const guessInsert = {
        guess: guessCur,
        game_id: game.id,
        is_correct: game.word === guessCur,
    };
    const guessCreateResponse = await createGuess(guessInsert);
    handleResponse(guessCreateResponse, 'guessCreate');
    if (game.word === guessCur) {
        await stopGameSend();
    }
});

// Calls to database
function handleResponse(response, type) {
    // Handle calls to database
    error = response.error;
    if (error) {
        displayError();
    } else {
        // this is called "short-circuit evaluation"
        // second expression only executes if the first is true
        // "if true" && "do this"
        type === 'gameUpdate' && (game = response.data);
        type === 'words' && (words = response.data);
        type === 'guessesGet' && (guesses = response.data);
        type === 'guessGet' && guesses.unshift(response.data);
        type === 'guessCreate' && addGuessForm.reset();
        type === 'userId' && (userId = response.id);
        type === 'userProfile' && (userProfile = response.data);
        type === 'updateProfile' && (userProfile = response.data);
        // console.log(user);
    }
}

/* GameState Functions */

// initiate start game
async function startGameSend() {
    // Update Game
    const gameUpdate = game;
    gameUpdate.game_in_progress = true;
    gameUpdate.game_state = 'in-progress';
    gameUpdate.start_time = Date.now();
    gameUpdate.word = generateWord().toLowerCase();
    const gameUpdateResponse = await updateGame(gameUpdate);
    handleResponse(gameUpdateResponse, 'gameUpdate');
}

// actually start game
async function startGameReceive() {
    if (!game.game_in_progress) {
        error.message = 'startGameReceive error';
        displayError();
        return;
    }
    if (userProfile.is_drawer) {
        disableDrawingMode(false);
        displayWord('drawer');
        displayGameInfo('in_progress', 'drawer');
    } else if (!userProfile.is_drawer) {
        displayWord('guesser');
        displayGameInfo('in_progress', 'guesser');
    }
    displayStartBtn('in_progress');
    configureTimer();
    resetCanvas();
}

// initiate stop game
async function stopGameSend() {
    // Update Game
    const gameUpdate = game;
    gameUpdate.game_in_progress = false;
    gameUpdate.game_state = 'results';
    gameUpdate.start_time = null;
    const gameUpdateResponse = await updateGame(gameUpdate);
    handleResponse(gameUpdateResponse, 'gameUpdate');
}

// actually stop game
async function stopGameReceive() {
    if (game.game_in_progress) {
        error.message = 'stopGameReceive error';
        displayError();
        return;
    }
    displayStartBtn('stopped');
    // update profile
    userProfile.is_drawer = false;
    const profileUpdateResponse = await updateProfile(userProfile);
    handleResponse(profileUpdateResponse, 'updateProfile');
    // update timer
    configureTimer();
    displayGameInfo('results');
}

// Continue a game on page reload
function continueGame() {
    if (game.game_in_progress) {
        displayStartBtn('in_progress');
        if (userProfile.is_drawer) {
            disableDrawingMode(false);
            displayWord('drawer');
            displayGameInfo('in_progress', 'drawer');
        } else if (!userProfile.is_drawer) {
            displayWord('guesser');
            displayGameInfo('in_progress', 'guesser');
        }
    } else {
        displayGameInfo('results');
        displayStartBtn('stopped');
    }
    configureTimer();
}

/* Timer Functions */

// Used to start/stop/continue game
function configureTimer() {
    if (game.game_in_progress) {
        resetTimer();
        // If no endTime -> calculate
        if (!timeObj.endTime) {
            timeObj.endTime = game.start_time + timeObj.lengthOfGame;
        }
        // If no current timer -> start timerTick
        if (!timeObj.Timer) {
            timeObj.Timer = setInterval(timerTick, 1000);
        }
    } else {
        timeObj && timeObj.Timer && clearInterval(timeObj.Timer);
        resetTimer();
        displayTime('stopped');
    }
}

// Executes every 1 second ~ called by setInterval(timerTick, 1000)
function timerTick() {
    if (game.game_in_progress) {
        // decrement timeLeft by 1 second
        timeObj.timeLeft = Math.floor((timeObj.endTime - Date.now()) / 1000);
        displayTime('in_progress');
        // if time is up ->
        if (timeObj.timeLeft <= 0) {
            stopGameSend();
        }
    }
}

/* Utility Functions */

// Automatically called by configureTimer()
function resetTimer() {
    timeObj = {
        lengthOfGame: 60000,
        endTime: null,
        timeLeft: 0,
        Timer: null,
    };
}

function generateWord() {
    // get word from words array
    const randomNumber = Math.floor(Math.random() * words.length);
    return words[randomNumber].word;
}

function scrollToBottomOfGuesses() {
    const guessListContainer = document.getElementById('guess-list-container');
    guessListContainer.scrollTop = guessListContainer.scrollHeight;
}

/* Display Functions */
function displayGame() {
    gameTitle.textContent = game.title;
    if (game.image_url) {
        gameImage.src = game.image_url;
    } else {
        gameImage.src = '/assets/game-placeholder.png';
    }
}
function displayGameInfo(gameState, role) {
    if (gameState === 'stopped') {
        gameInfo.textContent = 'Click the Start Game button to start!';
    } else if (gameState === 'results') {
        gameInfo.textContent = 'results';
    } else if (gameState === 'in_progress') {
        if (role === 'drawer') {
            gameInfo.textContent = 'Game Started: You are the Drawer!';
        } else if (role === 'guesser') {
            gameInfo.textContent = 'Game Started: You are a Guesser!';
        }
    } else {
        error.message = 'error in displayGameInfo';
        displayError();
    }
}
function displayTime(gameState) {
    if (gameState === 'in_progress') {
        timer.classList.remove('hidden');
        timer.textContent = `${timeObj.timeLeft} seconds`;
    } else if (gameState === 'stopped') {
        timer.textContent = `0 seconds`;
        timer.classList.add('hidden');
    } else {
        error.message = 'error in displayTime';
        displayError();
    }
}
function displayStartBtn(gameState) {
    if (gameState === 'in_progress') {
        startGameButton.disabled = true;
        startGameButton.classList.add('hidden');
    } else if (gameState === 'stopped') {
        startGameButton.disabled = false;
        startGameButton.classList.remove('hidden');
    } else {
        error.message = 'error in displayStartBtn';
        displayError();
    }
}
function displayWord(role) {
    if (game.word) {
        randomWord.textContent = game.word;
    }
    if (role === 'drawer') {
        randomWord.classList.remove('hidden');
    } else if (role === 'guesser') {
        randomWord.textContent = '';
        randomWord.classList.add('hidden');
    } else {
        error.message = 'error in displayWord';
        displayError();
    }
}
function displayGuesses() {
    guessList.innerHTML = '';

    for (const guess of guesses) {
        const guessEl = renderGuess(guess);
        if (guess.is_correct) {
            guessEl.classList.add('correct-answer');
        }
        guessList.prepend(guessEl);
        scrollToBottomOfGuesses();
    }
}
function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
