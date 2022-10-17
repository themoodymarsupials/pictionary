export function renderGame(game) {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = `/game/?id=${game.id}`;

    const h2 = document.createElement('h2');
    h2.textContent = game.title;

    const img = document.createElement('img');
    img.src = game.image_url;

    a.append(h2, img);
    li.append(a);

    return li;
}
