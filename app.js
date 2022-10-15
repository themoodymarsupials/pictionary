/* Imports */
// import './auth/user.js';
import { addPath, onPath } from './fetch-utils.js';

/* Get DOM Elements */
const canvasSrc = new fabric.Canvas('canvas-src');
const canvasDest = new fabric.Canvas('canvas-dest');

/* State */
const canvas = new fabric.Canvas('canvas');
canvasSrc.isDrawingMode = true;
const paths = [];

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
