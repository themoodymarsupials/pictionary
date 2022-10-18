/* Imports */
import '../auth/user.js';
import { updateProfile } from '../fetch-utils.js';

/* DOM Elements */
const errorDisplay = document.getElementById('error-display');
const profileForm = document.getElementById('profile-form');
const updateButton = document.getElementById('create-profile-button');
// const userNameInput = profileForm.querySelector('[name=username]');
// const pronounsInput = profileForm.querySelector('[name=pronouns]');

/* State */
// let profile = null;
let error = null;

/* Events */
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const buttonText = updateButton.textContent;
    updateButton.disabled = true;

    const formData = new FormData(profileForm);

    const profileUpdate = {
        username: formData.get('username'),
        pronouns: formData.get('pronouns'),
    };

    const response = await updateProfile(profileUpdate);
    error = response.error;

    if (error) {
        displayError();
        updateButton.disabled = false;
        updateButton.textContent = buttonText;
    } else {
        location.assign('../');
    }
});

/* Display Functions */
function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
