var canvas = document.getElementById('example');
var ctx = canvas.getContext('2d');

function main() 
{
    if (!canvas) 
    {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);
}

function getVector(v, x, y) 
{
    v.elements[0] = document.getElementById(x).value;;
    v.elements[1] = document.getElementById(y).value;
    v.elements[2] = 0;
}

function handleDrawEvent() 
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    main();

    let v1 = new Vector3();
    getVector(v1, "x1", "y1"); 
    drawVector(v1, "red");

    let v2 = new Vector3();
    getVector(v2, "x2", "y2"); 
    drawVector(v2, "blue");
}

function drawVector(v, color) 
{
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let scale = 20;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx+v.elements[0]*scale, cy-v.elements[1]*scale);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function angleBetween(v1, v2) 
{
   let dot = Vector3.dot(v1, v2);
   let magnitudes = v1.magnitude()*v2.magnitude();
   let angleRad = Math.acos(dot/magnitudes);
   let angleDeg = angleRad * (180 / Math.PI);

   return angleDeg;
}

function areaTriangle(v1, v2) 
{
    let crossV = new Vector3;
    crossV = Vector3.cross(v1, v2);
    let area = crossV.magnitude() / 2;

    return area;
}

function handleDrawOperationEvent() 
{
    handleDrawEvent();

    let operation = document.getElementById("op-select").value;
    let scale = document.getElementById("scalar").value;

    let v1 = new Vector3();
    getVector(v1, "x1", "y1"); 

    let v2 = new Vector3();
    getVector(v2, "x2", "y2"); 

    switch(operation) 
    {
        case "add":
            v1.add(v2);
            drawVector(v1, "green");
            break;

        case "sub":
            v1.sub(v2);
            drawVector(v1, "green");
            break;

        case "mul":
            v1.mul(scale);
            v2.mul(scale);
            drawVector(v1, "green");
            drawVector(v2, "green");
            break;

        case "div":
            v1.div(scale);
            v2.div(scale);
            drawVector(v1, "green");
            drawVector(v2, "green");
            break;

        case "angle":
            console.log("Angle: " + angleBetween(v1, v2));
            break;

        case "area":
            console.log("Area of the triangle: " + areaTriangle(v1, v2));
            break;
        
        case "mag":
            console.log("Magnitude v1: " + v1.magnitude());
            console.log("Magnitude v2: " + v2.magnitude());
            break;

        case "norm":
            v1.normalize();
            v2.normalize();
            drawVector(v1, "green");
            drawVector(v2, "green");
            break;
    }
}