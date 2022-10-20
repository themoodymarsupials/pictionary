/* Imports */

import '../auth/user.js';
import { renderProfile } from '../render-utils.js';
import { getProfiles } from '../fetch-utils.js';

/* DOM Elements */
const profileList = document.getElementById('profile-list');

/* State */
let error = null;
let profiles = [];

/* Events */
window.addEventListener('load', async () => {
    const response = await getProfiles();
    error = response.error;
    profiles = response.data;

    if (error) {
        console.log(error);
    }
    if (profiles) {
        displayProfiles();
    }
});

/* Display Functions */
async function displayProfiles() {
    for (const profile of profiles) {
        const profileEl = renderProfile(profile, profile.user_id);
        profileList.append(profileEl);
    }
}
