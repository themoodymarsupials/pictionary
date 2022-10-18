//imports
import '../auth/user.js';
import { getGame, createGuess, getWords, onGuess, getGuess, updateGame } from '../fetch-utils.js';
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
let time = 60000; // Start at 60s
let error = null;
let game = null;
// let gameInProgress = false;

// inprogress: timer running, people can draw, people can guess
// not inprogress: timer not running. people cannot draw. people cannot guess. If there is a winner in the database, display the winner.
let word = [];

//events
startGameButton.addEventListener('click', async () => {
    game.gameInProgress = true;
    console.log('game:', game);
    updateGame(game);
});

window.addEventListener('load', async () => {
    setInterval(timerTick, 1000);
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (!id) {
        location.replace('/');
        return;
    }

    const gameResponse = await getGame(id);
    const wordsResponse = await getWords();

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
        displayGame();
        displayGuesses();
    }

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
    if (time > 0) time -= 1000;
    displayTime();
    // console.log('time: ', time);
}

generateButton.addEventListener('click', () => {
    const randomNumber = Math.floor(Math.random() * word.length);
    randomWord.textContent = word[randomNumber].word;
});

//display functions
function displayGame() {
    gameTitle.textContent = game.title;
    gameImage.src = game.image_url;
}

function displayTime() {
    timer.textContent = `${time / 1000} seconds`;
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
