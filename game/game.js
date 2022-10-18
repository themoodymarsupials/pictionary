//imports
import '../auth/user.js';
import { getGame, createGuess } from '../fetch-utils.js';
import { renderGuess } from '../render-ultils.js';

//DOM
const errorDisplay = document.getElementById('error-display');
const gameTitle = document.getElementById('game-title');
const gameImage = document.getElementById('game-image');
const addGuessForm = document.getElementById('add-guess-form');
const guessList = document.getElementById('guess-list');

//state
let error = null;
let game = null;

//events
window.addEventListener('load', async () => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (!id) {
        location.replace('/');
        return;
    }

    const response = await getGame(id);
    error = response.error;
    game = response.data;

    if (error) {
        displayError();
    }

    if (!game) {
        location.replace('/');
    } else {
        displayGame();
        displayGuesses();
    }
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
        const guess = response.data;
        game.guesses.unshift(guess);
        displayGuesses();
        addGuessForm.reset();
    }
});

//display functions
function displayGame() {
    gameTitle.textContent = game.title;
    gameImage.src = game.image_url;
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
