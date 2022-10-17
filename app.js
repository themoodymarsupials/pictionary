/* Imports */
// import './auth/user.js';
import { addPath, getPaths, onPath } from './fetch-utils.js';

/* Get DOM Elements */
const canvasSrc = new fabric.Canvas('canvas-src');
const canvasDest = new fabric.Canvas('canvas-dest');

/* State */
canvasSrc.isDrawingMode = true;
let paths = [];
let error = null;

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

/* Display Functions */
function displayPaths() {
    // Format paths correctly for inserting into canvas
    const canvasPathsObj = {
        version: '5.2.4',
        objects: paths,
    };

    // console.log(canvasPathsObj);
    canvasDest.loadFromJSON(canvasPathsObj);
}

function displayError() {
    console.error(error);
}
