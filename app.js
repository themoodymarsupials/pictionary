/* Imports */
// this will check if we have a user and set signout link if it exists
// import './auth/user.js';
// import { fabric } from 'fabric';

import { addPath } from './fetch-utils.js';

const canvas = new fabric.Canvas('canvas');
canvas.isDrawingMode = true;
canvas.on('path:created', (options) => {
    console.log(options);
});

const canvasSrc = new fabric.Canvas('canvas-src');
const canvasDest = new fabric.Canvas('canvas-dest');
canvasSrc.isDrawingMode = true;
canvasSrc.on('path:created', async () => {
    const json = canvasSrc.toJSON();
    const newPathIndex = json.objects.length - 1;
    const newPath = json.objects[newPathIndex];

    const newPathObj = {
        path: newPath,
        index: newPathIndex,
    };
    console.log(newPathObj);

    const response = await addPath(newPathObj);

    console.log(response);

    // this would be over web-socket to/from the db after updating:
    canvasDest.loadFromJSON(json);
});

/* Get DOM Elements */

/* State */

/* Events */

/* Display Functions */
