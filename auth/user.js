import { getUser, signOutUser } from '../fetch-utils.js';

// make sure we have a user!
const user = getUser();

if (!user) {
    // redirect to /auth page, passing along where the user was redirected _from_
    location.replace(`/auth/?redirectUrl=${encodeURIComponent(location)}`);
}

// If there is a sign out link, attach handler for calling supabase signout
const signOutLink = document.getElementById('sign-out-link');
if (signOutLink) {
    signOutLink.addEventListener('click', () => {
        signOutUser();
    });
}
