/* Imports */
import '../auth/user.js';
import { updateProfile, getUser, getProfile, uploadImage } from '../fetch-utils.js';

/* DOM Elements */
const errorDisplay = document.getElementById('error-display');
const profileForm = document.getElementById('profile-form');
const updateButton = document.getElementById('create-profile-button');
const userNameInput = profileForm.querySelector('[name=username]');
const pronounsInput = profileForm.querySelector('[name=pronouns]');
const avatarInput = document.getElementById('avatar-input');
const preview = document.getElementById('preview');

/* State */
let profile = null;
let error = null;

const user = getUser;

/* Events */
window.addEventListener('load', async () => {
    const response = await getProfile(user.id);
    error = response.error;
    profile = response.data;
    if (error) {
        displayError();
    }
    if (profile) {
        displayProfile();
    }
});
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const buttonText = updateButton.textContent;
    updateButton.disabled = true;

    const formData = new FormData(profileForm);

    const profileUpdate = {
        username: formData.get('username'),
        pronouns: formData.get('pronouns'),
    };

    const imageFile = formData.get('avatar_url');
    const imagePath = `${user.id}/${imageFile.name}`;
    const url = await uploadImage('images', imagePath, imageFile);
    profileUpdate.avatar_url = url;

    const response = await updateProfile(profileUpdate, user.id);
    error = response.error;

    if (error) {
        displayError();
        updateButton.disabled = false;
        updateButton.textContent = buttonText;
    } else {
        location.assign('../');
    }
});

avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
    } else {
        preview.src = '../assets/pencil (1).png';
    }
});

/* Display Functions */
function displayProfile() {
    if (profile) {
        userNameInput.value = profile.username;
        pronounsInput.value = profile.pronouns;
        if (profile.avatar_url) {
            preview.src = profile.avatar_url;
        }
    }
}

function displayError() {
    if (error) {
        errorDisplay.textContent = error.message;
    } else {
        errorDisplay.textContent = '';
    }
}
