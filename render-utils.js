export function renderGame(game) {
    const li = document.createElement('li');
    li.classList.add('nes-container');
    li.classList.add('with-title');
    li.classList.add('is-centered');
    li.classList.add('is-rounded');

    const a = document.createElement('a');
    a.href = `/game/?id=${game.id}`;

    const p = document.createElement('p');
    p.textContent = game.title;
    p.classList.add('title');

    const img = document.createElement('img');
    if (game.image_url) {
        img.src = game.image_url;
    } else {
        img.src = '/assets/game-placeholder.png';
    }

    a.append(p, img);
    li.append(a);

    return li;
}

export function renderGuess(guess) {
    const li = document.createElement('li');
    li.textContent = guess.guess;
    li.classList.add('nes-input');
    return li;
}

/* Render Profiles */
export function renderProfile(profile, userId) {
    const li = document.createElement('li');
    li.classList.add('profile');

    if (userId === profile.id) {
        li.classList.add('self');
    }

    const userNameEl = document.createElement('h2');
    userNameEl.textContent = profile.username;

    const pronounsEl = document.createElement('p');
    pronounsEl.classList.add('pronouns');
    pronounsEl.textContent = profile.pronouns;

    const avatarImage = document.createElement('img');
    avatarImage.src = profile.avatar_url;

    li.append(userNameEl, pronounsEl, avatarImage);
    return li;
}
