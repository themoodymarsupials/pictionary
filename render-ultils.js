export function renderGame(game) {
    const li = document.createElement('li');

    const h2 = document.createElement('h2');
    h2.textContent = game.title;

    const img = document.createElement('img');
    img.src = game.image_url;

    li.append(h2, img);

    return li;
}
