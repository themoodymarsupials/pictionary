/* Imports */
// this will check if we have a user and set signout link if it exists
// import './auth/user.js';
// import { fabric } from 'fabric';

const canvas = new fabric.Canvas('canvas');
canvas.isDrawingMode = true;
canvas.on('path:created', (options) => {
    console.log(options);
});

const canvasSrc = new fabric.Canvas('canvas-src');
const canvasDest = new fabric.Canvas('canvas-dest');
canvasSrc.isDrawingMode = true;
canvasSrc.on('path:created', () => {
    const json = canvasSrc.toJSON();
    const newPath = json.objects[json.objects.length - 1];
    console.log(newPath);
    // this would be over web-socket to/from the db after updating:
    canvasDest.loadFromJSON(json);
});

/* Get DOM Elements */

/* State */

/* Events */

/* Display Functions */
