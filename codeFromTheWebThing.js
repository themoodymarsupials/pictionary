const button = document.getElementById('button');

// Do some initializing stuff
fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: 'rgba(102,153,255,0.5)',
    cornerSize: 12,
    padding: 5,
});

// initialize fabric canvas and assign to global windows object for debug
var canvas = (window._canvas = new fabric.Canvas('c'));
const canvasEl = document.getElementById('c');

canvas.add(
    new fabric.Circle({
        radius: 50,
        left: 150,
        top: 150,
        fill: '#0B61A4',
    })
);

button.addEventListener('click', () => {
    // JSON without additional properties
    //fabric.log('JSON without additional properties: ', canvas.toJSON());

    // JSON with additional properties included
    //fabric.log('JSON with additional properties included: ', canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockUniScaling']));

    // JSON without default values
    canvas.includeDefaultValues = false;
    fabric.log('JSON without default values: ', canvas.toJSON().objects[0]);
});

/* 
canvasEl.addEventListener('update', () => {

// JSON without additional properties
//fabric.log('JSON without additional properties: ', canvas.toJSON());

// JSON with additional properties included
//fabric.log('JSON with additional properties included: ', canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'lockUniScaling']));

// JSON without default values
canvas.includeDefaultValues = false;
fabric.log('JSON without default values: ', canvas.toJSON().objects[0].left, canvas.toJSON.objects[0].right);

}
); */
