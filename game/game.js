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
} from '../fetch-utils.js';
import { renderGuess } from '../render-ultils.js';

//DOM
const errorDisplay = document.getElementById('error-display');
const gameTitle = document.getElementById('game-title');
const gameImage = document.getElementById('game-image');
const addGuessForm = document.getElementById('add-guess-form');
const guessList = document.getElementById('guess-list');
const timer = document.getElementById('timer');
const randomWord = document.getElementById('random-word');
const startGameButton = document.getElementById('start-game');

//state
let lengthOfGame = 60000; // Start at 60s
let endTime = null;
let timeLeft = null;
let error = null;
let game = null;
let word = [];
// let gameInProgress = false;

// inprogress: timer running, people can draw, people can guess
// not inprogress: timer not running. people cannot draw. people cannot guess. If there is a winner in the database, display the winner.

//events
startGameButton.addEventListener('click', async () => {
    // Generate word
    const randomNumber = Math.floor(Math.random() * word.length);
    randomWord.textContent = word[randomNumber].word;

    // Change Game state
    game.game_in_progress = true;
    game.start_time = Date.now();
    console.log('game', game);
    // console.log('game:', game);
    updateGame(game);
});

window.addEventListener('load', async () => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (!id) {
        location.replace('/');
        return;
    }

    const gameResponse = await getGame(id);
    const wordsResponse = await getWords();
    // console.log(wordsResponse);

    function handleResponse(response, type) {
        error = response.error;
        type === 'game' && (game = response.data);
        type === 'word' && (word = response.data);
    }

    handleResponse(gameResponse, 'game');
    handleResponse(wordsResponse, 'word');

    if (error) {
        displayError();
    }

    if (!game) {
        location.replace('/');
    } else {
        if (game.game_in_progress) {
            endTime = game.start_time + lengthOfGame;
            setInterval(timerTick, 1000);
        }
        displayGame();
        displayGuesses();
    }
    console.log('game.start_time: ', game.start_time);
    console.log('endTime: ', endTime);
    console.log('timeLeft: ', timeLeft);

    onGuess(game.id, async (payload) => {
        const guessId = payload.new.id;
        const guessResponse = await getGuess(guessId);
        error = guessResponse.error;
        if (error) {
            displayError();
        } else {
            const guess = guessResponse.data;
            game.guesses.unshift(guess);
            displayGuesses();
        }
    });

    // execute on all game updates
    onGameUpdate(game.id, async (payload) => {
        game = payload.new;
        if (game.game_in_progress === true) {
            endTime = game.start_time + lengthOfGame;
        }
        console.log('game.start_time: ', game.start_time);
        console.log('endTime: ', endTime);
        console.log('timeLeft: ', timeLeft);
    });
});

addGuessForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(addGuessForm);
    const guessInsert = {
        guess: formData.get('guess'),
        game_id: game.id,
    };
    const response = await createGuess(guessInsert);
    error = response.error;

    if (error) {
        displayError();
    } else {
        addGuessForm.reset();
    }
});

function timerTick() {
    if (timeLeft < 0) return;
    timeLeft = Math.floor(endTime - Date.now());
    displayTime();
    // if (timeLeft > 0) endTime -= 1000;
    console.log(timeLeft);
    // console.log('time: ', time);
}

//display functions
function displayGame() {
    gameTitle.textContent = game.title;
    gameImage.src = game.image_url;
}

function displayTime() {
    // console.log('timeLeft:', timeLeft);
    timer.textContent = `${timeLeft} seconds`;

    // console.log(Date.now());
}

function displayGuesses() {
    guessList.innerHTML = '';

    for (const guess of game.guesses) {
        const guessEl = renderGuess(guess);
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
