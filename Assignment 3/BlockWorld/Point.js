class Point 
{
    constructor() 
    {
        this.type = "point";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render() 
    {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.disableVertexAttribArray(att_Position);
        gl.vertexAttrib1f(att_PointSize, size); // Pass vertex point size to attribute variable
        gl.vertexAttrib3f(att_Position, xy[0], xy[1], 0.0); // Pass the position of a point to a_Position variable
        gl.uniform4f(uni_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // Pass the color of a point to uni_FragColor variable
        gl.drawArrays(gl.POINTS, 0, 1); // Draw points
    }
}