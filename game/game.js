//imports
import '../auth/user.js';
import { getGame } from '../fetch-utils.js';

//DOM
const errorDisplay = document.getElementById('error-display');
const gameTitle = document.getElementById('game-title');
const gameImage = document.getElementById('game-image');

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
    }
});

//display functions
function displayGame() {
    gameTitle.textContent = game.title;
    gameImage.src = game.image_url;
}

function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
