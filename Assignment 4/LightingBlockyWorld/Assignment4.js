// Global Variables
let canvas;
let gl;
let att_Position;
let att_PointSize;
let a_UV;
let a_Normal;
let uni_FragColor;
let u_GlobalRotateMatrix;
let u_ModelMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_WhichTexture;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_LightPos;
let u_CameraPos;
let u_IsLightOn;
let u_NormalMatrix;
let u_LightColor;
let g_lightPos = [0,1,3];
let g_isNormalOn = false;
let g_isLightOn = true;
let g_isAnimLightOn = true;
let g_globalAngleX = 0.0;
let g_redLight = 2.0;
let g_greenLight = 2.0;
let g_blueLight = 2.0;
let g_head = 0;
var g_camera;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Vertex shader program
var VSHADER_SOURCE = 
    `
    attribute vec4 att_Position;
    attribute float att_PointSize;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_vertexPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_NormalMatrix;

    void main()
    {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * att_Position;
      gl_PointSize = att_PointSize;
      v_UV = a_UV;
      v_Normal = a_Normal;
      //v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));
      v_vertexPos = u_ModelMatrix * att_Position;
    }
    `

// Fragment shader program
var FSHADER_SOURCE =
    `
    precision mediump float;
    uniform vec4 uni_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform int u_WhichTexture;
    uniform vec3 u_LightPos;
    uniform vec3 u_CameraPos;
    uniform vec3 u_LightColor;
    uniform bool u_IsLightOn;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_vertexPos;

    void main() 
    {
        if (u_WhichTexture == -2) 
        {
            gl_FragColor = uni_FragColor;
        }
        else if (u_WhichTexture == -1) 
        {
            gl_FragColor = vec4(v_UV, 1, 1);
        }
        else if (u_WhichTexture == 0)
        {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }
        else if (u_WhichTexture == 1)
        {
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        }
        else if (u_WhichTexture == 2)
        {
            gl_FragColor = texture2D(u_Sampler2, v_UV);
        }
        else if (u_WhichTexture == 3)
        {
            gl_FragColor = texture2D(u_Sampler3, v_UV);
        }
        else 
        {
            gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
        }

        //vec3 lightVector = vec3(v_vertexPos) - u_LightPos;
        vec3 lightVector = u_LightPos - vec3(v_vertexPos);
        float radius = length(lightVector);
        //if (radius < 1.0) gl_FragColor = vec4(1,0,0,1);
        //else if (radius < 2.0) gl_FragColor = vec4(1,1,0,1);

        //gl_FragColor = vec4(vec3(gl_FragColor)/(radius*radius), 1);


        // N DOT L
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDOTL = max(dot(N,L), 0.0);

        // Reflection
        vec3 Ref = reflect(-L, N);

        // Eye
        vec3 Eye = normalize(u_CameraPos - vec3(v_vertexPos));

        // Specular
        float spec = pow(max(dot(Eye, Ref), 0.0), 375.0);

        vec3 diffuse = vec3(gl_FragColor) * nDOTL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;
        vec3 lightColor = u_LightColor;
        if (u_IsLightOn) 
        {
            if (u_WhichTexture < 0 || u_WhichTexture > 3) gl_FragColor = vec4(lightColor * (spec + diffuse + ambient), 1.0);
            else { gl_FragColor = vec4(lightColor * (diffuse + ambient), 1.0); }
        }
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

    g_camera = new Camera(canvas.width / canvas.height);

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
    
    a_UV = gl.getAttribLocation(gl.program, 'a_UV'); // Get the storage location of a_UV variable
    if (a_UV < 0) 
    {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal'); // Get the storage location of a_Normal variable
    if (a_Normal < 0) 
    {
        console.log('Failed to get the storage location of a_Normal');
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

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); // Get the storage location of the u_Sampler
    if (!u_Sampler0) 
    {
        console.log("Failed to get the storage location of u_Sampler0");
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); // Get the storage location of the u_Sampler
    if (!u_Sampler1) 
    {
        console.log("Failed to get the storage location of u_Sampler1");
        return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2'); // Get the storage location of the u_Sampler
    if (!u_Sampler2) 
    {
        console.log("Failed to get the storage location of u_Sampler2");
        return false;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3'); // Get the storage location of the u_Sampler
    if (!u_Sampler3) 
    {
        console.log("Failed to get the storage location of u_Sampler3");
        return false;
    }

    u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
    if (!u_WhichTexture) 
    {
        console.log("Failed to get the storage location of u_WhichTexture");
        return false;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) 
    {
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) 
    {
        console.log("Failed to get the storage location of u_ProjectionMatrix");
        return;
    }

    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    if (!u_LightPos) 
    {
        console.log('Failed to get the storage location of u_LightPos');
        return;
    }

    u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
    if (!u_CameraPos) 
    {
        console.log('Failed to get the storage location of u_CameraPos');
        return;
    }

    u_IsLightOn = gl.getUniformLocation(gl.program, 'u_IsLightOn');
    if (!u_IsLightOn) 
    {
        console.log('Failed to get the storage location of u_IsLightOn');
        return;
    }

    //u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    //if (!u_NormalMatrix) 
    //{
    //    console.log("Failed to get the storage location of u_NormalMatrix");
    //    return;
    //}

    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    if (!u_LightColor) 
    {
        console.log('Failed to get storage location of u_LightColor');
        return;
    }
}

function initTextures() 
{    
    var sky = new Image(); // Create an image object
    if (!sky) 
    {
        console.log("Failed to create image object");
        return false;
    }
    sky.onload = function(){ sendImageToTEXTURE0(sky); }; // Register the event handler to be called on loading an image
    sky.src = 'darkSky.jpeg'; // Tell the browser to load an image


    var ground = new Image(); // Create an image object
    if (!ground) 
    {
        console.log("Failed to create image object");
        return false;
    }
    ground.onload = function(){ sendImageToTEXTURE1(ground); };
    ground.src = 'ground.jpeg';


    var bush = new Image(); // Create an image object
    if (!bush) 
    {
        console.log("Failed to create image object");
        return false;
    }
    bush.onload = function(){ sendImageToTEXTURE2(bush); };
    bush.src = 'bush.jpeg';

    var face = new Image(); // Create an image object
    if (!face) 
    {
        console.log("Failed to create image object");
        return false;
    }
    face.onload = function(){ sendImageToTEXTURE3(face); };
    face.src = 'smile.jpeg';
    

    return true;
}

function sendImageToTEXTURE0(image) 
{
    var texture = gl.createTexture(); // Create a texture object
    if (!texture) 
    {
        console.log("Failed to create the texture object");
        return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE0); // Enable the texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Set the texture parameters
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // Set the texture image
    gl.uniform1i(u_Sampler0, 0); // Set the texture unit 0 to the sampler
    console.log("Finished loadTexture");
}

function sendImageToTEXTURE1(image) 
{
    var texture = gl.createTexture(); // Create a texture object
    if (!texture) 
    {
        console.log("Failed to create the texture object");
        return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE1); // Enable the texture unit
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Set the texture parameters
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // Set the texture image
    gl.uniform1i(u_Sampler1, 1); // Set the texture unit to the sampler
    console.log("Finished loadTexture");
}

function sendImageToTEXTURE2(image) 
{
    var texture = gl.createTexture(); // Create a texture object
    if (!texture) 
    {
        console.log("Failed to create the texture object");
        return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE2); // Enable the texture unit
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Set the texture parameters
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // Set the texture image
    gl.uniform1i(u_Sampler2, 2); // Set the texture unit to the sampler
    console.log("Finished loadTexture");
}

function sendImageToTEXTURE3(image) 
{
    var texture = gl.createTexture(); // Create a texture object
    if (!texture) 
    {
        console.log("Failed to create the texture object");
        return false;
    }
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    gl.activeTexture(gl.TEXTURE3); // Enable the texture unit
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture object to the target
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Set the texture parameters
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // Set the texture image
    gl.uniform1i(u_Sampler3, 3); // Set the texture unit to the sampler
    console.log("Finished loadTexture");
}

function renderScene() 
{
    var startTime = performance.now();
    
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

    var globalXRotMat = new Matrix4().rotate(g_globalAngleX,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalXRotMat.elements);

    gl.uniform3f(u_LightColor, g_redLight, g_greenLight, g_blueLight);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ground = new Cube();
    ground.color = [0,.9,.4,1];
    ground.textureNum = 1;
    ground.matrix.setTranslate(-10,-1.8,-8);
    ground.matrix.scale(50,.85,70);
    ground.drawCube();

    var sky = new Cube();
    sky.color = [0,0,1,1];
    if (!g_isNormalOn) sky.textureNum = 0;
    else { sky.textureNum = 4; }
    sky.matrix.setTranslate(45,50,60);
    sky.matrix.scale(-80,-50,-180);
    sky.drawCube();

    var normCube = new Cube();
    normCube.textureNum = 5;
    normCube.matrix.translate(3,.5,4);
    normCube.matrix.scale(1,1,2);
    normCube.normalMatrix.setInverseOf(normCube.matrix).transpose();
    normCube.drawCube();

    var sphere = new Sphere();
    if (g_isNormalOn) sphere.textureNum = 5;
    sphere.color = [.5,.5,.5,1];
    sphere.matrix.translate(0,2,6);
    sphere.render();

    gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_CameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_IsLightOn, g_isLightOn);

    var lightSource = new Cube();
    lightSource.color = [g_redLight,g_greenLight,g_blueLight,1];
    lightSource.textureNum = -2;
    lightSource.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    lightSource.matrix.scale(-.1,-.1,-.1);
    lightSource.drawCube();

    //var lightPost = new Cube();
    //lightPost.color = [.2,.2,.2,1];
    //lightPost.textureNum = -2;
    //lightPost.matrix.translate(-2,-.8,0);
    //lightPost.matrix.scale(.5,4,1);
    //lightPost.drawCube();
    //var lightbulb = new Sphere();
    //sphere.textureNum = 4;
    //lightbulb.matrix.translate(-2,2.7,0);
    //lightbulb.matrix.scale(.2,.2,.2);
    //lightbulb.render();

    //gl.uniform3f(u_LightPos, lightbulb.matrix.elements[12], lightbulb.matrix.elements[13], lightbulb.matrix.elements[14]); // Needs Tweaking

    drawBushes();
    drawTrees();
    //drawWoman();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function drawWoman() 
{
    var head = new Cube();
    head.textureNum = 3;
    head.matrix.setTranslate(8,.7,6.5);
    head.matrix.rotate(-30,1,0,0);
    head.matrix.rotate(g_head,0,1,0);
    head.matrix.scale(0.40,0.44,0.70);
    head.drawCube();
    head.color = [.1,.1,.1,1];
    head.textureNum = -2;
    head.matrix.setTranslate(8.4,.38,6.4);
    head.matrix.rotate(-10,1,0,0);
    head.matrix.rotate(g_head,0,1,0);
    head.matrix.scale(0.1,0.74,0.75);
    head.drawCube();
    head.matrix.setTranslate(7.9,.38,6.4);
    head.matrix.rotate(-10,1,0,0);
    head.matrix.rotate(g_head,0,1,0);
    head.matrix.scale(0.1,0.74,0.75);
    head.drawCube();
    head.matrix.setTranslate(7.94,.45,7.1);
    head.matrix.rotate(-30,1,0,0);
    head.matrix.rotate(90,0,1,0);
    head.matrix.rotate(g_head,0,1,0);
    head.matrix.scale(0.1,0.94,1);
    head.drawCube();

    var leftArm = new Cube();
    leftArm.color = [0.19,0.19,0.19,1.0];
    leftArm.textureNum = -2;
    leftArm.matrix.setTranslate(7.8,0.47,6.17);
    leftArm.matrix.rotate(-20,0,0,1);
    leftArm.matrix.scale(0.18,.55,0.2);
    leftArm.drawCube();
    leftArm.matrix.setTranslate(7.8,0.43,6.35);
    leftArm.matrix.rotate(55,1,0,0);
    leftArm.matrix.rotate(80,0,1,0);
    leftArm.matrix.scale(0.18,.55,0.2);
    leftArm.drawCube();

    var rightArm = new Cube();
    rightArm.color = [0.19,0.19,0.19,1.0];
    rightArm.textureNum = -2;
    rightArm.matrix.setTranslate(8.4,0.4,6.15);
    rightArm.matrix.rotate(20,0,0,1);
    rightArm.matrix.scale(0.18,.55,0.2);
    rightArm.drawCube();
    rightArm.matrix.setTranslate(8.43,0.43,6.35);
    rightArm.matrix.rotate(55,1,0,0);
    rightArm.matrix.rotate(80,0,1,0);
    rightArm.matrix.scale(0.18,.55,0.2);
    rightArm.drawCube();
    
    var topBody = new Cube();
    topBody.color = [0.14,0.14,0.14,1.0];
    topBody.textureNum = -2;
    topBody.matrix.setTranslate(7.9,0.3,6.6);
    topBody.matrix.rotate(-15,1,0,0);
    topBody.matrix.scale(0.6,.5,0.75);
    topBody.drawCube();

    var bottomBody = new Cube();
    bottomBody.color = [0.14,0.14,0.14,1.0];
    bottomBody.textureNum = -2;
    bottomBody.matrix.setTranslate(7.83,-.9,6.5);
    bottomBody.matrix.scale(.75,1.3,.95);
    bottomBody.drawCube();
}

function drawBushes() 
{
    var bush = [];
    let x = 0;
    let y = 0;

    for (i = 0; i < 10; i++) 
    {
        bush[i] = new Cube();
        bush[i].textureNum = 2;
        bush[i].matrix.translate((i*5) - 10, -1, -8);
        bush[i].matrix.scale(5, 1, 3);
        bush[i].drawCube();
    }
    for (i; i < 18; i++) 
    {
        bush[i] = new Cube();
        bush[i].textureNum = 2;
        bush[i].matrix.translate(-10, -1, x - 6.5);
        bush[i].matrix.scale(1, 1, 8);
        bush[i].drawCube();
        x += 4;
    }
    x = 0;
    for (i; i < 28; i++) 
    {
        bush[i] = new Cube();
        bush[i].textureNum = 2;
        bush[i].matrix.translate((y*5) - 10, -1, 25.5);
        bush[i].matrix.scale(5, 1, 3);
        bush[i].drawCube();
        y++;
    }
    for (i; i < 36; i++) 
    {
        bush[i] = new Cube();
        bush[i].textureNum = 2;
        bush[i].matrix.translate(39, -1, x - 6.5);
        bush[i].matrix.scale(1, 1, 8);
        bush[i].drawCube();
        x += 4
    }
}

function drawTrees() 
{
    trunk1 = new Cube();
    trunk1.textureNum = -2;
    trunk1.color = [.55,.33,0,1];
    trunk1.matrix.translate(20, -1, 20);
    trunk1.matrix.scale(1, 4, 3);
    trunk1.drawCube();
    branches1 = new Cube();
    branches1.textureNum = 1;
    branches1.matrix.translate(19, 2.5, 19);
    branches1.matrix.scale(4, 3, 8);
    branches1.drawCube();

    trunk2 = new Cube();
    trunk2.textureNum = -2;
    trunk2.color = [.55,.33,0,1];
    trunk2.matrix.translate(5, -1, 0);
    trunk2.matrix.scale(1, 4, 3);
    trunk2.drawCube();
    branches2 = new Cube();
    branches2.textureNum = 1;
    branches2.matrix.translate(3.5, 2, -1);
    branches2.matrix.scale(4, 2.5, 8);
    branches2.drawCube();

    trunk3 = new Cube();
    trunk3.textureNum = -2;
    trunk3.color = [.55,.33,0,1];
    trunk3.matrix.translate(25, -1, 0);
    trunk3.matrix.scale(1, 4, 3);
    trunk3.drawCube();
    branches3 = new Cube();
    branches3.textureNum = 1;
    branches3.matrix.translate(23.5, 1, -1);
    branches3.matrix.scale(4, 2, 8);
    branches3.drawCube();
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
    document.getElementById("normalOn").onclick = function() { g_isNormalOn = true; };
    document.getElementById("normalOff").onclick = function() { g_isNormalOn = false; };
    document.getElementById("lightOn").onclick = function() { g_isLightOn = true; };
    document.getElementById("lightOff").onclick = function() { g_isLightOn = false; };
    document.getElementById("animLightOn").onclick = function() { g_isAnimLightOn = true; tick(); };
    document.getElementById("animLightOff").onclick = function() { g_isAnimLightOn = false; tick(); };
    document.getElementById("anglSlide").addEventListener('mousemove', function() { g_globalAngleX = this.value; renderScene(); });
    document.getElementById("lightXSlide").addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightPos[0] = this.value/100; renderScene(); } });
    document.getElementById("lightYSlide").addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightPos[1] = this.value/100; renderScene(); } });
    document.getElementById("lightZSlide").addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { g_lightPos[2] = this.value/100; renderScene(); } });
    document.getElementById("redColorSlide").addEventListener('mousemove', function() { g_redLight = this.value/100; renderScene(); });
    document.getElementById("greenColorSlide").addEventListener('mousemove', function() { g_greenLight = this.value/100; renderScene(); });
    document.getElementById("blueColorSlide").addEventListener('mousemove', function() { g_blueLight = this.value/100; renderScene(); });
} 

function tick() 
{
    g_seconds = performance.now() / 1000.0 - g_startTime;
    g_head = 20*Math.sin(3*g_seconds);

    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick); // Tell browser to update again when it has time 
}

function updateAnimationAngles() 
{
    if (g_isAnimLightOn) 
    {
        g_lightPos[0] = Math.cos(g_seconds + 50) * 5;
        g_lightPos[1] = Math.sin(g_seconds) + 1;
    }
}

function keydown(ev) 
{
    if (ev.keyCode == 65) g_camera.moveSideways(1);
    else if (ev.keyCode == 68) g_camera.moveSideways(0);
    else if (ev.keyCode == 87) g_camera.moveForwardsBackwards(1);
    else if (ev.keyCode == 83) g_camera.moveForwardsBackwards(0);
    else if (ev.keyCode == 81) g_camera.pan(1);
    else if (ev.keyCode == 69) g_camera.pan(0);
    renderScene();
    //console.log(ev.keyCode);
}

function main() 
{
    setWebGL();
    makeVarsToGLSL();
    addHtmlUIActions();

    document.onkeydown = keydown;

    initTextures();

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set the color for clearing <canvas>
    requestAnimationFrame(tick);
}