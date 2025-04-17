// Const Variables
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables
let canvas;
let gl;
let att_Position;
let att_PointSize;
let uni_FragColor;
let g_selectColor = [1.0, 1.0, 1.0, 1.0];
let g_sizeSelect = 5.0;
let g_segSelect = 5.0;
var g_shapeList = [];
let g_typeSelect = POINT;

// Vertex shader program
var VSHADER_SOURCE = 
    `
    attribute vec4 att_Position;
    attribute float att_PointSize;
    void main()
    {
      gl_Position = att_Position;
      gl_PointSize = att_PointSize;
    }
    `

// Fragment shader program
var FSHADER_SOURCE =
    `
    precision mediump float;
    uniform vec4 uni_FragColor;
    void main() 
    {
        gl_FragColor = uni_FragColor;
    }
    `

function setWebGL() 
{
    canvas = document.getElementById('webgl'); // Retrieve <canvas> element
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true}); // Get the rendering context for WebGL
    if (!gl) 
    {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function makeVarsToGLSL() 
{
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) // Initialize shaders
    {
        console.log('Failed to initialize shaders.'); 
        return;
    }

    att_Position = gl.getAttribLocation(gl.program, 'att_Position'); // Get the storage location of att_Position variable
    if (att_Position < 0) 
    {
        console.log('Failed to get the storage location of att_Position');
        return;
    }

    att_PointSize = gl.getAttribLocation(gl.program, 'att_PointSize'); // Get the storage location of att_PointSize variable
    if (att_PointSize < 0) 
    {
        console.log('Failed to get the storage location of att_PointSize');
        return;
    }

    uni_FragColor = gl.getUniformLocation(gl.program, 'uni_FragColor');
    if (!uni_FragColor) 
    {
        console.log('Failed to get uni_FragColor variable');
        return;
    }
}

function convCoords(ev) 
{
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return [x,y];
}

function renderShapes() 
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapeList.length; // Array Length
    for(var i = 0; i < len; i++) 
    {
        g_shapeList[i].render();
    }
}

function click(ev) 
{
    let point;
    switch(g_typeSelect) 
    {
        case POINT:
            point = new Point();
            break;
        case TRIANGLE:
            point = new Triangle();
            break;
        case CIRCLE:
            point = new Circle();
            point.segments = g_segSelect;
    }
    point.position = convCoords(ev); // Store coordinates to new class
    point.color = g_selectColor.slice(); // Store color to new class
    point.size = g_sizeSelect // Store size to new class
    g_shapeList.push(point);

    renderShapes();
}

function drawPicture() 
{
    /*let x = ((200) - canvas.width/2)/(canvas.width/2);
    let y = (canvas.height/2 - (350))/(canvas.height/2);
    let point = new Triangle();

    point.position = [-.65, .13];
    point.color = [0.7, 0.5, 0.0, 1.0];
    point.size = 50.0;
    g_shapeList.push(point);

    renderShapes();*/
}

function addHtmlUIActions() 
{
    document.getElementById("Clear").onclick = function() { g_shapeList = []; renderShapes(); };
    document.getElementById("point").onclick = function() { g_typeSelect = POINT };
    document.getElementById("drawing").onclick = function() { drawPicture(); };
    document.getElementById("triangle").onclick = function() { g_typeSelect = TRIANGLE };
    document.getElementById("circle").onclick = function() { g_typeSelect = CIRCLE };

    document.getElementById("rSlide").addEventListener('mouseup', function() { g_selectColor[0] = this.value/100 });
    document.getElementById("gSlide").addEventListener('mouseup', function() { g_selectColor[1] = this.value/100 });
    document.getElementById("bSlide").addEventListener('mouseup', function() { g_selectColor[2] = this.value/100 });
    
    document.getElementById("sizeSlide").addEventListener('mouseup', function() { g_sizeSelect = this.value });
    document.getElementById("segSlide").addEventListener('mouseup', function() { g_segSelect = this.value });
}

function main() 
{
    setWebGL();
    makeVarsToGLSL();
    addHtmlUIActions();

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) click(ev); };

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set the color for clearing <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>
}