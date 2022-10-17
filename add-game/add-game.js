//imports
import '../auth/user.js';
import { createGame } from '../fetch-utils.js';

//DOM
const addGameForm = document.getElementById('add-game-form');
const errorDisplay = document.getElementById('error-display');

//state
let error = null;

//events
addGameForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(addGameForm);

    const game = {
        title: formData.get('title'),
        // image_url: url,
    };

    const response = await createGame(game);
    error = response.error;

    if (error) {
        displayError();
    } else {
        location.assign('../');
    }
});

//display functions
function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
