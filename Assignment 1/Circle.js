class Circle
{
    constructor() 
    {
        this.type = "circle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10.0;
    }

    render() 
    {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        var d = this.size/200.0; //Delta
        let angleStep = 360/this.segments;

        for (var angle = 0; angle < 360; angle+=angleStep) 
        {
            let centerPoint = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            let point1 = [centerPoint[0]+vec1[0], centerPoint[1]+vec1[1]];
            let point2 = [centerPoint[0]+vec2[0], centerPoint[1]+vec2[1]];

            drawTriangle([xy[0], xy[1], point1[0], point1[1], point2[0], point2[1]]); // Draw Circle
        }

        gl.vertexAttrib1f(att_PointSize, size); // Pass vertex point size to attribute variable
        gl.uniform4f(uni_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // Pass the color of a point to uni_FragColor variable
    }
}

    function drawTriangle(vertices) 
    {
        var n = 3; //Num of vertices
        var v = new Float32Array(vertices);
    
        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) 
        {
            console.log('Failed to create the buffer object');
            return -1;
        }
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // Bind the buffer object to target
        gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW); // Write date into the buffer object

        gl.vertexAttribPointer(att_Position, 2, gl.FLOAT, false, 0, 0); // Assign the buffer object to att_Position variable
        gl.enableVertexAttribArray(att_Position); // Enable the assignment to att_Position variable
        gl.drawArrays(gl.TRIANGLES, 0, n); // Draw triangle with num of vertices
    }