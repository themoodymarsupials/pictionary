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
let error = null;
let userId = null;
let userProfile = null;

// inprogress: timer running, people can draw, people can guess
// not inprogress: timer not running. people cannot draw. people cannot guess. If there is a winner in the database, display the winner.

//events
window.addEventListener('load', async () => {
    // get gameID
    const searchParams = new URLSearchParams(location.search);
    const gameId = searchParams.get('id');
    if (!gameId) {
        location.replace('/');
        return;
    }
    //get User and profile
    const userResponse = await getUser();
    handleResponse(userResponse, 'userId');
    const userProfileResponse = await getProfile(userId);
    handleResponse(userProfileResponse, 'userProfile');

    // Get game/word/guesses from database
    const gameResponse = await getGame(gameId);
    handleResponse(gameResponse, 'game');
    const wordsResponse = await getWords();
    handleResponse(wordsResponse, 'words');
    const guessesGetResponse = await getGuesses(gameId);
    handleResponse(guessesGetResponse, 'guessesGet');

    // IF game is stopped -> set all users to guessers
    if (game.game_in_progress === false) {
        userProfile.is_drawer = false;
        disableDrawingMode(true);
    }

    // If NO game -> exit
    if (!game) {
        location.replace('/');
    } else {
        resetTimer();
        configureTimer();
        displayGame();
        displayGuesses();
        displayWord();
        checkDrawer();
    }

    // execute on all game updates
    onGameUpdate(game.id, async (payload) => {
        game = payload.new;
        if (game.game_in_progress === false) {
            gameInfo.textContent = 'Game is over';
            await stopGame();
        } else {
            gameInfo.textContent = 'The game has started!';
        }
        resetTimer();
        configureTimer();
        displayWord();
    });

    onGuess(game.id, async (payload) => {
        const guessId = payload.new.id;
        const guessGetResponse = await getGuess(guessId);
        handleResponse(guessGetResponse, 'guessGet');
        displayGuesses();
    });
});

startGameButton.addEventListener('click', async () => {
    // if game is in progress -> deactivate button
    if (game.game_in_progress === true) {
        startGameButton.disabled = true;
        return;
    }

    // Update Game + Set timer
    gameInfo.textContent = 'The game has started!';
    userProfile.is_drawer = true;
    disableDrawingMode(false);
    const profileUpdateResponse = await updateProfile(userProfile);
    handleResponse(profileUpdateResponse, 'updateProfile');

    checkDrawer();
    resetCanvas();
    game.game_in_progress = true;
    game.word = generateWord().toLowerCase();
    game.start_time = Date.now();
    timeObj.endTime = game.start_time + timeObj.lengthOfGame;
    updateGame(game);
});

addGuessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkDrawer()) {
        gameInfo.textContent = 'You are the Drawer!';
        return;
    }
    const formData = new FormData(addGuessForm);
    guessCur = formData.get('guess').toLowerCase();
    const guessInsert = {
        guess: guessCur,
        game_id: game.id,
        is_correct: game.word === guessCur,
        // is_correct: checkGuess(),
    };
    const guessCreateResponse = await createGuess(guessInsert);
    handleResponse(guessCreateResponse, 'guessCreate');
    await checkGuess();
});

async function checkGuess() {
    if (game.word === guessCur) {
        await stopGame();
        gameInfo.textContent = 'You are awesome! ...also the game is over!';
        return true;
    } else {
        return false;
    }
}

function checkDrawer() {
    if (userProfile.is_drawer) {
        randomWord.classList.remove('hidden');
        disableDrawingMode(false);
        return true;
    } else {
        return false;
    }
}

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
        type === 'game' && (game = response.data);
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

/* Utility Functions */
async function stopGame() {
    if (game.game_in_progress) {
        game.game_in_progress = false;
        game.game_state = 'results';
        await updateGame(game);
    }
    startGameButton.disabled = false;
    userProfile.is_drawer = false;
    timeObj.timeLeft = 0;
    clearInterval(timeObj.Timer);
    resetTimer();
    await updateProfile(userProfile);
}

function resetTimer() {
    timeObj = {
        lengthOfGame: 60000,
        endTime: null,
        timeLeft: 0,
        Timer: null,
    };
}

function configureTimer() {
    // more "short-circuit evaluations"
    if (game.game_in_progress) {
        // If no endTime -> calculate
        if (!timeObj.endTime) {
            timeObj.endTime = game.start_time + timeObj.lengthOfGame;
        }
        // If no current timer -> start timerTick
        if (!timeObj.Timer) {
            timeObj.Timer = setInterval(timerTick, 1000);
        }
        // !timeObj.endTime && (timeObj.endTime = game.start_time + timeObj.lengthOfGame);
        // !timeObj.Timer && (timeObj.Timer = setInterval(timerTick, 1000));
    }
}

function generateWord() {
    // get word from words array
    const randomNumber = Math.floor(Math.random() * words.length);
    return words[randomNumber].word;
}

// Executes every 1 second ~ called by setInterval(timerTick, 1000)
function timerTick() {
    // debugger;
    if (game.game_in_progress) {
        // decrement timeLeft by 1 second
        timeObj.timeLeft = Math.floor((timeObj.endTime - Date.now()) / 1000);
        // if time is up ->
        if (timeObj.timeLeft <= 0) {
            stopGame();
        }
    }
    displayTime();
}

//display functions
function displayGame() {
    gameTitle.textContent = game.title;
    if (game.image_url) {
        gameImage.src = game.image_url;
    } else {
        gameImage.src = '/assets/game-placeholder.png';
    }
}
function displayTime() {
    timer.textContent = `${timeObj.timeLeft} seconds`;
}
function displayWord() {
    if (game.word) {
        randomWord.textContent = game.word;
    }
    if (userProfile.is_drawer === false) {
        randomWord.classList.add('hidden');
    }
}
function displayGuesses() {
    guessList.innerHTML = '';

    for (const guess of guesses) {
        const guessEl = renderGuess(guess);
        if (guess.is_correct) {
            guessEl.classList.add('correct-answer');
        }
        guessList.append(guessEl);
    }
}
function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
