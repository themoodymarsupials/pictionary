/* Imports */
// this will check if we have a user and set signout link if it exists
// import './auth/user.js';
// import { fabric } from 'fabric';
import { addPath, onPath } from './fetch-utils.js';

/* Get DOM Elements */
const canvasSrc = new fabric.Canvas('canvas-src');
const canvasDest = new fabric.Canvas('canvas-dest');

/* State */
const canvas = new fabric.Canvas('canvas');
canvas.isDrawingMode = true;
canvas.on('path:created', (options) => {
    console.log(options);
});

/* Events */
window.addEventListener('load', async () => {
    onPath(async (payload) => {
        const copyPath = payload.new;
        const copyPathObj = {
            version: '5.2.4',
            path: copyPath.path,
        };
        canvasDest.loadFromJSON(copyPathObj);
    });
});

canvasSrc.isDrawingMode = true;
canvasSrc.on('path:created', async () => {
    const json = canvasSrc.toJSON();
    const newPathIndex = json.objects.length - 1;
    const newPath = json.objects[newPathIndex];

    canvasDest.loadFromJSON(json);
    const newPathObj = {
        path: newPath,
        index: newPathIndex,
    };

    const response = await addPath(newPathObj);
    console.log(response);

    // this would be over web-socket to/from the db after updating:
});

/* Display Functions */
