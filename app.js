/* Imports */
// import './auth/user.js';
import { addPath, onPath } from './fetch-utils.js';

/* Get DOM Elements */
const canvasSrc = new fabric.Canvas('canvas-src');
const canvasDest = new fabric.Canvas('canvas-dest');
const colorSelector = document.getElementById('color-selector');
const brushWidthSelector = document.getElementById('brush-width');

/* State */
const canvas = new fabric.Canvas('canvas');
const paths = [];
let drawingColor = '#000000'; // Defaults to black
let brushWidth = 10;

// Fabric initializing stuff
canvasSrc.isDrawingMode = true;

canvas.on('path:created', (options) => {
    console.log(options);
});

/* Events */
window.addEventListener('load', async () => {
    // Realtime Path Rendering from database
    onPath(async (payload) => {
        // Get path from database
        const copyPath = payload.new;
        paths.push(copyPath.path);
        // Format paths correctly for inserting into canvas
        const copyPathObj = {
            version: '5.2.4',
            objects: paths,
        };
        // Insert paths into destination canvas
        canvasDest.loadFromJSON(copyPathObj);
    });
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
    canvasSrc.freeDrawingBrush.color = drawingColor;
    canvasSrc.freeDrawingBrush.width = brushWidth;
}

/* Display Functions */
