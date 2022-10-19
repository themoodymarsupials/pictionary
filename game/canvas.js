/* Imports */
// import './auth/user.js';
import { addPath, clearCanvas, getPaths, onPath, getGame } from '../fetch-utils.js';

/* Get DOM Elements */
const canvasSrc = new fabric.Canvas('canvas-src', {
    width: '500',
    height: '500',
    isDrawingMode: true,
});

const clearCanvasButton = document.getElementById('clear-canvas');
const colorSelector = document.getElementById('color-selector');
const drawModeSelector = document.getElementById('draw-mode');
const eraseModeSelector = document.getElementById('erase-mode');

/* State */
let paths = [];
let error = null;
let game = null;

canvasSrc.freeDrawingBrush.width = 10;
let drawMode = 'draw';
let drawingColor = '#000000'; // Defaults to black
let drawingColorCache = drawingColor; // Saves color

/* Events */
window.addEventListener('load', async () => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (!id) {
        location.replace('/');
        return;
    }

    const gameResponse = await getGame(id);
    error = gameResponse.error;
    game = gameResponse.data;

    if (error) {
        displayError();
    }

    const response = await getPaths(game.id);
    error = response.error;

    if (error) {
        displayError();
    } else {
        paths = response.data.map((a) => a.path);
        // console.log('paths on load', paths);
        displayPaths();
    }

    onPath(async (payload) => {
        // Get path from database
        const copyPath = payload.new;

        if (copyPath.room === game.id) {
            if (payload.eventType === 'DELETE') {
                paths = [];
            } else if (payload.eventType === 'INSERT') {
                paths.push(copyPath.path);
            }
        }
        // Insert paths into destination canvas
        displayPaths();
    });
    updateBrush();
});

clearCanvasButton.addEventListener('click', resetCanvas);

// Insert new paths into database
canvasSrc.on('path:created', async () => {
    const json = canvasSrc.toJSON();
    const newPathIndex = json.objects.length - 1;
    const newPath = json.objects[newPathIndex];
    const newPathObj = {
        path: newPath,
        index: newPathIndex,
        room: game.id,
    };

    const response = await addPath(newPathObj);
    error = response.error;
    if (error) displayError();
});

// Change To Select Mode
eraseModeSelector.addEventListener('click', () => {
    drawMode = 'erase';
    updateBrush();
});
// Change To Draw Mode
drawModeSelector.addEventListener('click', () => {
    drawMode = 'draw';
    updateBrush();
});
// Change Drawing Color
colorSelector.addEventListener('click', () => {
    drawMode = 'draw';
    updateBrush();
});
// Change Drawing Color
colorSelector.addEventListener('input', () => {
    drawMode = 'draw';
    drawingColorCache = colorSelector.value;
    updateBrush();
});

export async function resetCanvas() {
    const response = await clearCanvas(game.id);
    error = response.error;
    if (error) {
        displayError();
    } else {
        paths = [];
        displayPaths();
    }
}

function updateBrush() {
    // Fabric updating stuff
    if (drawMode === 'draw') {
        canvasSrc.freeDrawingBrush.width = 12;
        drawModeSelector.classList.add('btn-active');
        eraseModeSelector.classList.remove('btn-active');
        drawingColor = drawingColorCache;
    } else {
        canvasSrc.freeDrawingBrush.width = 20;
        drawModeSelector.classList.remove('btn-active');
        eraseModeSelector.classList.add('btn-active');
        drawingColor = 'white';
    }
    canvasSrc.freeDrawingBrush.color = drawingColor;
}

/* Display Functions */
function displayPaths() {
    // Format paths correctly for inserting into canvas
    const canvasPathsObj = {
        version: '5.2.4',
        objects: paths,
    };
    // console.log('canvasSrc.objects: ', canvasSrc._objects);
    canvasSrc.loadFromJSON(canvasPathsObj);
}

function displayError() {
    console.error(error);
}
