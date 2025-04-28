// Global Variables
let canvas;
let gl;
let att_Position;
let att_PointSize;
let uni_FragColor;
let u_ModelMatrix;
let g_globalAngleX = 0.0;
let g_globalAngleY = 0.0;
let g_angleSelect = 0.0;
let g_lThighAngle = 8.0;
let g_lLegAngle = 160.0;
let g_rThighAngle = 8.0;
let g_rLegAngle = 160.0;
let g_rArmAngle = 35.0;
let g_lArmAngle = 30.0;
let g_tailAngle = 0.0;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
let animation = false;

// Vertex shader program
var VSHADER_SOURCE = 
    `
    attribute vec4 att_Position;
    attribute float att_PointSize;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main()
    {
      gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * att_Position;
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

    gl.enable(gl.DEPTH_TEST);
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

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) 
    {
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) 
    {
        console.log("Failed to get the storage location of u_GlobalRotateMatrix");
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

function renderScene() 
{
    var startTime = performance.now();
    var globalXRotMat = new Matrix4().rotate(g_globalAngleX,0,1,0);
    var globalYRotMat = new Matrix4().rotate(g_globalAngleY,1,0,0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalXRotMat.elements);
    //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalYRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var head = new Cube();
    head.color = [0.4,0.88,0.93,1.0];
    head.matrix.setTranslate(-0.33,0.2,-0.3);
    head.matrix.rotate(-15,1,0,0);
    head.matrix.scale(0.65,0.64,0.80);
    head.drawCube();

    var glasses = new Triangle();
    glasses.color = [0.05,0.05,0.05,1.0];
    glasses.matrix.setTranslate(-0.16,0.7,-0.46);
    glasses.matrix.rotate(170,1,0,0);
    glasses.matrix.scale(0.60,0.45,0.0);
    glasses.render3DTriangle();
    glasses.matrix.setTranslate(0.16,0.7,-0.46);
    glasses.matrix.rotate(170,1,0,0);
    glasses.matrix.scale(0.60,0.45,0.0);
    glasses.render3DTriangle();
    
    var frontShell = new Cube();
    frontShell.color = [0.94,0.94,0.5,1.0];
    frontShell.matrix.setTranslate(-0.4,-0.6,0.0);
    frontShell.matrix.rotate(-15,1,0,0);
    frontShell.matrix.scale(0.8,1.0,0.6);
    frontShell.drawCube();

    var middleShell = new Cube();
    middleShell.color = [0.9,0.9,0.9,1.0];
    middleShell.matrix.setTranslate(-0.44,-0.54,0.29);
    middleShell.matrix.rotate(-15,1,0,0);
    middleShell.matrix.scale(0.88,1.03,0.1);
    middleShell.drawCube();

    var backShell = new Cube();
    backShell.color = [0.8,0.55,0.0,1.0];
    backShell.matrix.setTranslate(-0.44,-0.51,0.33);
    backShell.matrix.rotate(-15,1,0,0);
    backShell.matrix.scale(0.88,1.0,0.7);
    backShell.drawCube();

    var leftArm = new Cube();
    leftArm.color = [0.4,0.88,0.93,1.0];
    leftArm.matrix.setTranslate(0.4,-0.1,-0.33);
    leftArm.matrix.rotate(45,0,0,1);
    leftArm.matrix.rotate(g_lArmAngle,1,0,0);
    leftArm.matrix.scale(0.25,0.5,0.4);
    leftArm.drawCube();

    var rightArm = new Cube();
    rightArm.color = [0.4,0.88,0.93,1.0];
    rightArm.matrix.setTranslate(-0.54,0.08,-0.33);
    rightArm.matrix.rotate(-45,0,0,1);
    rightArm.matrix.rotate(g_rArmAngle,1,0,0);
    rightArm.matrix.scale(0.25,0.5,0.4);
    rightArm.drawCube();

    var leftThigh = new Cube();
    leftThigh.color = [0.4,0.88,0.93,1.0];
    leftThigh.matrix.setTranslate(0.38,-0.42,0.13);
    leftThigh.matrix.rotate(10,0,0,1);
    leftThigh.matrix.rotate(-180,0,1,0);
    leftThigh.matrix.rotate(g_lThighAngle,1,0,0);
    var lThighCoordMat = new Matrix4(leftThigh.matrix);
    leftThigh.matrix.scale(0.25,-0.23,0.38);
    leftThigh.drawCube();

    var leftLeg = new Cube();
    leftLeg.matrix = lThighCoordMat;
    leftLeg.color = [0.4,0.88,0.93,1.0];
    leftLeg.matrix.translate(0.0,-0.15,0.191);
    leftLeg.matrix.rotate(g_lLegAngle,1,0,0);
    leftLeg.matrix.scale(0.25,0.20,0.383);
    leftLeg.drawCube();

    var rightThigh = new Cube();
    rightThigh.color = [0.4,0.88,0.93,1.0];
    rightThigh.matrix.setTranslate(-0.13,-0.48,0.13);
    rightThigh.matrix.rotate(-10,0,0,1);
    rightThigh.matrix.rotate(-180,0,1,0);
    rightThigh.matrix.rotate(g_rThighAngle,1,0,0);
    var rThighCoordMat = new Matrix4(rightThigh.matrix);
    rightThigh.matrix.scale(0.25,-0.23,0.38);
    rightThigh.drawCube();

    var rightLeg = new Cube();
    rightLeg.matrix = rThighCoordMat;
    rightLeg.color = [0.4,0.88,0.93,1.0];
    rightLeg.matrix.translate(0.0,-0.14,0.191);
    rightLeg.matrix.rotate(g_rLegAngle,1,0,0);
    rightLeg.matrix.scale(0.25,0.20,0.383);
    rightLeg.drawCube();

    var tail = new Cube();
    var tailX = 1;
    var tailY = 1;
    var tailZ = 1;
    tail.color = [0.4,0.88,0.93,1.0];
    tail.matrix.setTranslate(-0.13,-0.67,0.27);
    tail.matrix.rotate(g_tailAngle,tailX,tailY,tailZ);
    tail.matrix.scale(0.22,0.15,0.4);
    tail.drawCube();
    tail.matrix.setTranslate(-0.17,-0.67,0.47);
    tail.matrix.rotate(-17,1,0,0);
    tail.matrix.rotate(g_tailAngle,tailX,tailY,tailZ);
    tail.matrix.scale(0.3,0.15,0.4);
    tail.drawCube();
    tail.matrix.setTranslate(-0.20,-0.61,0.66);
    tail.matrix.rotate(-23,1,0,0);
    tail.matrix.rotate(g_tailAngle,tailX,tailY,tailZ);
    tail.matrix.scale(0.36,0.15,0.36);
    tail.drawCube();
    tail.matrix.setTranslate(-0.22,-0.55,0.80);
    tail.matrix.rotate(-25,1,0,0);
    tail.matrix.rotate(g_tailAngle,tailX,tailY,tailZ);
    tail.matrix.scale(0.4,0.15,0.42);
    tail.drawCube();
    tail.matrix.setTranslate(-0.24,-0.42,0.73);
    tail.matrix.rotate(-23,1,0,0);
    tail.matrix.rotate(g_tailAngle,tailX,tailY,tailZ);
    tail.matrix.scale(0.44,0.36,0.45);
    tail.drawCube();
    
    /*var leftFoot = new Triangle();
    leftFoot.color = [0.4,0.88,0.93,1.0];
    leftFoot.matrix.setTranslate(0.15,-0.64,-0.05);
    leftFoot.matrix.rotate(80,0,1,0);
    leftFoot.matrix.scale(0.20,0.25,0.25);
    leftFoot.render3DTriangle();
    leftFoot.matrix.setTranslate(0.35,-0.64,-0.05);
    leftFoot.matrix.rotate(35,0,1,0);
    leftFoot.matrix.scale(0.20,0.25,0.30);
    leftFoot.render3DTriangle();
    leftFoot.matrix.setTranslate(0.35,-0.64,-0.05);
    leftFoot.matrix.rotate(-50,0,1,0);
    leftFoot.matrix.scale(0.20,0.25,0.30);
    leftFoot.render3DTriangle();
*/
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID) 
{
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) 
    {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function addHtmlUIActions() 
{
    document.getElementById("animation").onclick = function() { if (animation) animation = false; else { animation = true; }};
    document.getElementById("anglSlide").addEventListener('mousemove', function() { g_globalAngleX = this.value; renderScene(); });
    document.getElementById("lThighSlide").addEventListener('mousemove', function() { g_lThighAngle = this.value; renderScene(); });
    document.getElementById("lLegSlide").addEventListener('mousemove', function() { g_lLegAngle = this.value; renderScene(); });
    document.getElementById("rThighSlide").addEventListener('mousemove', function() { g_rThighAngle = this.value; renderScene(); });
    document.getElementById("rLegSlide").addEventListener('mousemove', function() { g_rLegAngle = this.value; renderScene(); });
    document.getElementById("tailSlide").addEventListener('mousemove', function() { g_tailAngle = this.value; renderScene(); });
}

function tick() 
{
    g_seconds = performance.now() / 1000.0 - g_startTime;

    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick); // Tell browser to update again when it has time 
}

function updateAnimationAngles() 
{
    let tailAngleMult = 25;
    let bottomAngleMult = 20;
    
    if (animation) 
    {
        g_tailAngle = tailAngleMult*Math.sin(3*g_seconds);
        g_lArmAngle = 30 + (3*Math.sin(4*g_seconds));
        g_rArmAngle = 35 + (3*Math.cos(4*g_seconds));
        g_lThighAngle = bottomAngleMult*Math.sin(3.5*g_seconds);
        g_lLegAngle = 180 + (bottomAngleMult*Math.sin(3.6*g_seconds));
        g_rThighAngle = bottomAngleMult*Math.cos(3.5*g_seconds);
        g_rLegAngle = 180 + (bottomAngleMult*Math.cos(3.6*g_seconds));
    }
}

function click(ev) 
{
    mousePos(ev);
}

function mousePos(e) 
{
    g_globalAngleX = e.pageX*0.5 + 180;
    g_globalAngleY = e.pageY*0.5 + 180;
}

function main() 
{
    setWebGL();
    makeVarsToGLSL();
    addHtmlUIActions();

    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) click(ev); };

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set the color for clearing <canvas>
    //renderScene();
    requestAnimationFrame(tick);
}