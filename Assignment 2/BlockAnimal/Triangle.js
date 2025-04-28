class Triangle 
{
    constructor() 
    {
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.matrix = new Matrix4();
        this.buffer = null;
    }

    render() 
    {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        var d = this.size/200.0; //Delta

        gl.vertexAttrib1f(att_PointSize, size); // Pass vertex point size to attribute variable
        gl.uniform4f(uni_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // Pass the color of a point to uni_FragColor variable
        drawTriangle([xy[0], xy[1], xy[1]+d, xy[1], xy[0], xy[1]+d]); // Draw triangle
    }

    render3DTriangle() 
    {
        var rgba = this.color;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); // Pass the matrix to u_ModelMatrix attribute

        // Front Side
        gl.uniform4f(uni_FragColor, rgba[0]*.95, rgba[1]*.95, rgba[2]*.95, rgba[3]); // Pass the color of a point to uni_FragColor variable
        draw3DTriangle([0.5,0.0,0.0, 0.0,0.5,0.25, -0.5,0.0,0.0]);

        // Right Side
        gl.uniform4f(uni_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        draw3DTriangle([0.5,0.0,0.0, 0.0,0.5,0.25, 0.5,0.0,0.5]);

        //Left Side
        gl.uniform4f(uni_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        draw3DTriangle([-0.5,0.0,0.0, 0.0,0.5,0.25, -0.5,0.0,0.5]);

        //Back Side
        gl.uniform4f(uni_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        draw3DTriangle([0.5,0.0,0.5, 0.0,0.5,0.25, -0.5,0.0,0.5]);
    }
}

function drawTriangle(vertices) 
{
    var n = 3; //Num of vertices
    var v = new Float32Array(vertices);
    
    var bufferVertex = gl.createBuffer();
    if (!bufferVertex) 
    {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertex); // Bind the buffer object to target
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW); // Write date into the buffer object

    gl.vertexAttribPointer(att_Position, 2, gl.FLOAT, false, 0, 0); // Assign the buffer object to att_Position variable
    gl.enableVertexAttribArray(att_Position); // Enable the assignment to att_Position variable
    gl.drawArrays(gl.TRIANGLES, 0, n); // Draw triangle with num of vertices
}

function draw3DTriangle(vertices) 
{
    var n = 3; //Num of vertices
    var v = new Float32Array(vertices);
        
    var bufferVertex = gl.createBuffer();
    if (!bufferVertex) 
    {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertex); // Bind the buffer object to target
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW); // Write date into the buffer object

    gl.vertexAttribPointer(att_Position, 3, gl.FLOAT, false, 0, 0); // Assign the buffer object to att_Position variable
    gl.enableVertexAttribArray(att_Position); // Enable the assignment to att_Position variable
    gl.drawArrays(gl.TRIANGLES, 0, n); // Draw triangle with num of vertices
}