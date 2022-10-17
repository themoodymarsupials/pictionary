/* Imports */
// this will check if we have a user and set signout link if it exists
import './auth/user.js';
import { getGames } from './fetch-utils.js';
import { renderGame } from './render-ultils.js';

/* Get DOM Elements */
const gameList = document.getElementById('game-list');
const errorDisplay = document.getElementById('error-display');

/* State */
let error = null;
let games = [];

/* Events */
window.addEventListener('load', async () => {
    const response = await getGames();
    error = response.error;
    games = response.data;

    if (error) {
        displayError();
    }

    if (games) {
        displayGames();
    }
});

/* Display Functions */
function displayGames() {
    gameList.innerHTML = '';

    for (const game of games) {
        const gameEl = renderGame(game);
        gameList.append(gameEl);
    }
}

function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
