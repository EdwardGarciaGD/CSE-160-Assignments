class Sphere 
{
  constructor() 
  {
    this.type = "sphere";
    this.color = [1,1,1,1];
    this.matrix = new Matrix4();
    this.textureNum = -2;
    this.verts32 = new Float32Array([]);
  }

  render() 
  {
    var rgba = this.color;
        
    gl.uniform1i(u_WhichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements); // Pass the matrix to u_ModelMatrix attribute

    var d = Math.PI / 10;
    var dd = Math.PI / 10;

    for (var t = 0; t < Math.PI; t+=d) 
    {
      for (var r = 0; r < (2*Math.PI); r+=d) 
      {
        var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
        var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)]
        var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
        var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

        var v = [];
        var uv = [];

        v = v.concat(p1);
        uv = uv.concat([0,0]);

        v = v.concat(p2);
        uv = uv.concat([0,0]);

        v = v.concat(p4);
        uv = uv.concat([0,0]);
        gl.uniform4f(uni_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        drawUVNormal3DTriangle(v,uv,v);

        v = [];
        uv = [];

        v = v.concat(p1);
        uv = uv.concat([0,0]);

        v = v.concat(p4);
        uv = uv.concat([0,0]);

        v = v.concat(p3);
        uv = uv.concat([0,0]);
        gl.uniform4f(uni_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
        drawUVNormal3DTriangle(v,uv,v);
      }
    }
  }
  
}
