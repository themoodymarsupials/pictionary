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
import { resetCanvas } from './canvas.js';

//DOM
const errorDisplay = document.getElementById('error-display');
const gameTitle = document.getElementById('game-title');
const gameImage = document.getElementById('game-image');
const addGuessForm = document.getElementById('add-guess-form');
const guessList = document.getElementById('guess-list');
const timer = document.getElementById('timer');
const randomWord = document.getElementById('random-word');
const startGameButton = document.getElementById('start-game');
const claimDrawerButton = document.getElementById('claim-drawer-button');

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
startGameButton.addEventListener('click', async () => {
    // if game is in progress -> deactivate button
    if (game.game_in_progress === true) {
        startGameButton.disabled = true;
        return;
    }

    // Update Game + Set timer
    checkDrawer();
    resetCanvas();
    game.game_in_progress = true;
    game.word = generateWord();
    game.start_time = Date.now();
    timeObj.endTime = game.start_time + timeObj.lengthOfGame;
    updateGame(game);
});

claimDrawerButton.addEventListener('click', async () => {
    userProfile.is_drawer = true;
    const profileUpdateResponse = updateProfile(userProfile);
    handleResponse(profileUpdateResponse, 'updateProfile');
});

window.addEventListener('load', async () => {
    //get User and profile
    const userResponse = await getUser();
    handleResponse(userResponse, 'userId');

    const userProfileResponse = await getProfile(userId);
    handleResponse(userProfileResponse, 'userProfile');

    // get gameID
    const searchParams = new URLSearchParams(location.search);
    const gameId = searchParams.get('id');
    if (!gameId) {
        location.replace('/');
        return;
    }

    // Get game and word from database
    const gameResponse = await getGame(gameId);
    handleResponse(gameResponse, 'game');
    const wordsResponse = await getWords();
    handleResponse(wordsResponse, 'words');
    const guessesGetResponse = await getGuesses(gameId);
    handleResponse(guessesGetResponse, 'guessesGet');

    // If NO game -> exit
    if (!game) {
        location.replace('/');
    } else {
        resetTimer();
        configureTimer();
        displayGame();
        displayGuesses();
        displayWord();
    }

    onGuess(game.id, async (payload) => {
        const guessId = payload.new.id;
        const guessGetResponse = await getGuess(guessId);
        handleResponse(guessGetResponse, 'guessGet');
        displayGuesses();
    });

    // execute on all game updates
    onGameUpdate(game.id, async (payload) => {
        game = payload.new;
        configureTimer();
        displayWord();
    });
});

addGuessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addGuessForm);
    guessCur = formData.get('guess');

    const guessInsert = {
        guess: formData.get('guess'),
        game_id: game.id,
        is_correct: checkGuess(),
    };
    const guessCreateResponse = await createGuess(guessInsert);
    handleResponse(guessCreateResponse, 'guessCreate');
});

function checkGuess() {
    if (game.word === guessCur) {
        console.log(game.word, guessCur);
        return true;
    } else {
        return false;
    }
}

function checkDrawer() {
    if (userProfile.is_drawer) {
        randomWord.classList.remove('hidden');
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
        // If no current timer -> start timerTick
        !timeObj.Timer && (timeObj.Timer = setInterval(timerTick, 1000));
        // If no endTime -> calculate
        !timeObj.endTime && (timeObj.endTime = game.start_time + timeObj.lengthOfGame);
    }
}

function generateWord() {
    // get word from words array
    const randomNumber = Math.floor(Math.random() * words.length);
    return words[randomNumber].word;
}

// Executes every 1 second ~ called by setInterval(timerTick, 1000)
function timerTick() {
    if (game.game_in_progress) {
        // decrement timeLeft by 1 second
        timeObj.timeLeft = Math.floor((timeObj.endTime - Date.now()) / 1000);
        // if time is up ->
        if (timeObj.timeLeft < 0) {
            timeObj.timeLeft = 0;
            game.game_in_progress = false;
            startGameButton.disabled = false;
            clearInterval(timeObj.Timer);
            resetTimer();
            updateGame(game);
        }
    }
    displayTime();
}

//display functions
function displayGame() {
    gameTitle.textContent = game.title;
    gameImage.src = game.image_url;
}
function displayTime() {
    timer.textContent = `${timeObj.timeLeft} seconds`;
}
function displayWord() {
    if (game.word) {
        randomWord.textContent = game.word;
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
