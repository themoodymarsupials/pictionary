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
    img.src = game.image_url;

    a.append(p, img);
    li.append(a);

    return li;
}

export function renderGuess(guess) {
    const li = document.createElement('li');
    li.textContent = guess.guess;
    li.classList.add('nes-container');
    return li;
}
