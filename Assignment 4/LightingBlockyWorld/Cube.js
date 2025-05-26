class Cube
{
    constructor() 
    {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -1;
    }

    drawCube() 
    {
        var rgba = this.color;
        
        gl.uniform1i(u_WhichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); // Pass the matrix to u_ModelMatrix attribute

        // Front Side
        gl.uniform4f(uni_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); // Pass the color of a point to uni_FragColor variable
        drawUVNormal3DTriangle([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
        drawUVNormal3DTriangle([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
        
        //drawUV3DTriangle([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        //drawUV3DTriangle([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        // Back Side
        //gl.uniform4f(uni_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawUVNormal3DTriangle([0,0,.5, 1,1,.5, 1,0,.5], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
        drawUVNormal3DTriangle([0,0,.5, 0,1,.5, 1,1,.5], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
        
        //drawUV3DTriangle([0,0,.5, 1,1,.5, 1,0,.5], [0,0, 1,1, 1,0]);
        //drawUV3DTriangle([0,0,.5, 0,1,.5, 1,1,.5], [0,0, 0,1, 1,1]);

        // Left Side
        //gl.uniform4f(uni_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawUVNormal3DTriangle([0,0,0, 0,1,0, 0,1,.5], [1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
        drawUVNormal3DTriangle([0,0,0, 0,0,.5, 0,1,.5], [1,0, 0,0, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
        
        //drawUV3DTriangle([0,0,0, 0,1,0, 0,1,.5], [1,0, 1,1, 0,1]);
        //drawUV3DTriangle([0,0,0, 0,0,.5, 0,1,.5], [1,0, 0,0, 0,1]);
        

        // Right Side
        //gl.uniform4f(uni_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawUVNormal3DTriangle([1,0,0, 1,1,0, 1,1,.5], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
        drawUVNormal3DTriangle([1,0,0, 1,0,.5, 1,1,.5], [0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
        
        //drawUV3DTriangle([1,0,0, 1,1,0, 1,1,.5], [0,0, 0,1, 1,1]);
        //drawUV3DTriangle([1,0,0, 1,0,.5, 1,1,.5], [0,0, 1,0, 1,1]);

        // Bottom Side
        //gl.uniform4f(uni_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawUVNormal3DTriangle([0,0,.5, 1,0,.5, 0,0,0], [1,0, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
        drawUVNormal3DTriangle([0,0,0, 1,0,0, 1,0,.5], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
        
        //drawUV3DTriangle([0,0,.5, 1,0,.5, 0,0,0], [1,0, 1,1, 0,0]);
        //drawUV3DTriangle([0,0,0, 1,0,0, 1,0,.5], [0,0, 0,1, 1,1]);

        // Top Side
        //gl.uniform4f(uni_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawUVNormal3DTriangle([0,1,.5, 1,1,.5, 0,1,0], [0,1, 1,1, 0,0], [0,-1,0, 0,-1,0, 0,-1,0]);
        drawUVNormal3DTriangle([0,1,0, 1,1,0, 1,1,.5], [0,0, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
        
        //drawUV3DTriangle([0,1,.5, 1,1,.5, 0,1,0], [0,1, 1,1, 0,0]);
        //drawUV3DTriangle([0,1,0, 1,1,0, 1,1,.5], [0,0, 1,0, 1,1]);
    }
}