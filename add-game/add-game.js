//imports
import '../auth/user.js';
import { createGame, uploadImage } from '../fetch-utils.js';

//DOM
const addGameForm = document.getElementById('add-game-form');
const errorDisplay = document.getElementById('error-display');
const imageInput = document.getElementById('image-input');
const formImage = document.getElementById('form-image');

//state
let error = null;

//events
addGameForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(addGameForm);
    const imageFile = formData.get('image');
    const randomFolder = Math.floor(Date.now() * Math.random());
    const imagePath = `/${randomFolder}/${imageFile.name}`;
    const url = await uploadImage('images', imagePath, imageFile);

    const game = {
        title: formData.get('title'),
        image_url: url,
    };

    const response = await createGame(game);
    error = response.error;

    if (error) {
        displayError();
    } else {
        location.assign('../');
    }
});

imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        formImage.src = URL.createObjectURL(file);
    } else {
        formImage.src = '../assets/game-placeholder.png';
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
