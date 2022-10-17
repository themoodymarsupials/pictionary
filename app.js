/* Imports */
// import './auth/user.js';
import { addPath, getPaths, onPath } from './fetch-utils.js';

/* Get DOM Elements */
const canvasSrc = new fabric.Canvas('canvas-src');
const canvasDest = new fabric.Canvas('canvas-dest');

const colorSelector = document.getElementById('color-selector');
const brushWidthSelector = document.getElementById('brush-width');
const drawModeSelector = document.getElementById('draw-mode');
const selectModeSelector = document.getElementById('select-mode');

/* State */
canvasSrc.isDrawingMode = true;
let paths = [];
let error = null;

let canvasMode = 'draw';
let drawingColor = '#000000'; // Defaults to black
let brushWidth = 10;

/* Events */
window.addEventListener('load', async () => {
    // Realtime Path Rendering from database
    const response = await getPaths();
    error = response.error;

    if (error) {
        displayError();
    } else {
        paths = response.data.map((a) => a.path);
        console.log(paths);
        displayPaths();
    }

    onPath(async (payload) => {
        // Get path from database
        const copyPath = payload.new;
        paths.push(copyPath.path);
        // Insert paths into destination canvas
        displayPaths();
    });
    updateBrush();
});

// Change To Select Mode
selectModeSelector.addEventListener('input', () => {
    canvasMode = document.querySelector('input[name="mode-selector"]:checked').value;
    console.log(`canvasMode changed to: ${canvasMode}`);
    updateBrush();
});
// Change To Draw Mode
drawModeSelector.addEventListener('input', () => {
    canvasMode = document.querySelector('input[name="mode-selector"]:checked').value;
    console.log(`canvasMode changed to: ${canvasMode}`);
    updateBrush();
});
// Change Drawing Color
colorSelector.addEventListener('input', () => {
    drawingColor = colorSelector.value;
    console.log(`color changed to: ${drawingColor}`);
    updateBrush();
});
// Change Brush Width
brushWidthSelector.addEventListener('input', () => {
    brushWidth = brushWidthSelector.value;
    console.log(`brush width changed to: ${brushWidth}`);
    updateBrush();
});

// Insert new paths into database
canvasSrc.on('path:created', async () => {
    const json = canvasSrc.toJSON();
    const newPathIndex = json.objects.length - 1;
    const newPath = json.objects[newPathIndex];

    const newPathObj = {
        path: newPath,
        index: newPathIndex,
    };

    const response = await addPath(newPathObj);
    console.log(response);
});

function updateBrush() {
    // Fabric updating stuff
    if (canvasMode === 'draw') {
        canvasSrc.isDrawingMode = true;
    } else {
        canvasSrc.isDrawingMode = false;
    }
    canvasSrc.freeDrawingBrush.color = drawingColor;
    canvasSrc.freeDrawingBrush.width = brushWidth;
}

/* Display Functions */
function displayPaths() {
    // Format paths correctly for inserting into canvas
    const canvasPathsObj = {
        version: '5.2.4',
        objects: paths,
    };

    // console.log(canvasPathsObj);
    canvasDest.loadFromJSON(canvasPathsObj);
    canvasSrc.loadFromJSON(canvasPathsObj);
}

function displayError() {
    console.error(error);
}
