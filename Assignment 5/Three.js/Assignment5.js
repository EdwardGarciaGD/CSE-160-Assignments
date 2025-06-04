import * as THREE from 'three';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

// Global Variables
let canvas = document.querySelector('#c');
let scene = new THREE.Scene();
let renderer;
let fov = 70;
let aspect = 2;  // the canvas default
let near = 0.1;
let far = 1000;
let camera;
let controls;
let sky;
let heart;
let heartLight;
let numOfSnowflakes;
let maxRange;
let minRange;
let minHeight;
let snowGeometry;
let particles;
let petals;
let positions = [], velocities = [];

class CustomSinCurve extends THREE.Curve 
{
  constructor( scale ) 
  { 
    super();
		this.scale = scale;
	}
  getPoint( t ) 
  {
		const tx = t * 3 - 1.5;
		const ty = Math.sin( 2 * Math.PI * t );
		const tz = 0;
		return new THREE.Vector3( tx, ty, tz ).multiplyScalar( this.scale );
	}
}

function setUpCamera() 
{
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.x = 25;
  camera.position.z = 55;
  camera.position.y = 7;
  
  // AWSDEF and hold n drag mouse flight movement
  controls = new FlyControls( camera, canvas );
  controls.dragToLook = true;
  controls.movementSpeed = .2;
}

function makeShapeInstance(geometry, color, x=0, y=0, z=0) 
{
  const material = new THREE.MeshLambertMaterial({color});
  const shape = new THREE.Mesh(geometry, material);
  scene.add(shape);
  shape.position.x = x;
  shape.position.y = y;
  shape.position.z = z;
 
  return shape;
}

function makeStandardShapeInstance(geometry, color, x=0, y=0, z=0) 
{
  const material = new THREE.MeshStandardMaterial({color});
  const shape = new THREE.Mesh(geometry, material);
  scene.add(shape);
  shape.position.x = x;
  shape.position.y = y;
  shape.position.z = z;
 
  return shape;
}

function makeTextureShape(geometry, texture, x=0, y=0, z=0) 
{
  const material = new THREE.MeshLambertMaterial({map: texture});
  const shape = new THREE.Mesh(geometry, material);
  scene.add(shape);
  shape.position.x = x;
  shape.position.y = y;
  shape.position.z = z;
 
  return shape;
}

// Snowflake particles effect
function addSnowFlakes() 
{
  snowGeometry = new THREE.BufferGeometry();
  numOfSnowflakes = 25000;
  maxRange = 200;
  minRange = maxRange/2;
  minHeight = 150;
  const texture = new THREE.TextureLoader().load('assets/snowflake.png')
  for (let i=0; i < numOfSnowflakes; i++) 
  {
    positions.push(
      Math.floor(Math.random() * maxRange - minRange),
      Math.floor(Math.random() * minRange + minHeight),
      Math.floor(Math.random() * maxRange - minRange)
    );
    velocities.push(
      Math.floor(Math.random() * 6 - 3) * .1,
      Math.floor(Math.random() * 5 + .12) * .12,
      Math.floor(Math.random() * 6 - 3) * .1
    );
  }
  snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  snowGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
  const material = new THREE.PointsMaterial(
  {
    size: 1.2, // Snowflake size
    map: texture,
    //color: 0xFFFFFF,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    transparent: true,
    opacity: 2
  });

  // Create the Points object and add it to the scene
  particles = new THREE.Points(snowGeometry, material);
  scene.add(particles);
}

// Snowflake particles update
function updateParticles() 
{
  for (let i=0; i < numOfSnowflakes*3; i+=3) 
  {
    particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i];
    particles.geometry.attributes.position.array[i+1] -= particles.geometry.attributes.velocity.array[i+1];
    particles.geometry.attributes.position.array[i+2] -= particles.geometry.attributes.velocity.array[i+2];
    
    if (particles.geometry.attributes.position.array[i+1] < 0) 
    {
      particles.geometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange);
      particles.geometry.attributes.position.array[i+1] = Math.floor(Math.random() * minRange + minHeight)
      particles.geometry.attributes.position.array[i+2] = Math.floor(Math.random() * maxRange - minRange)
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;
}

function setUpScene() 
{
  // Skybox with texture
  sky = new THREE.TextureLoader().load("assets/darkSky.jpg");
  sky.mapping = THREE.EquirectangularReflectionMapping;
  sky.colorSpace = THREE.SRGBColorSpace;
  scene.background = sky;

  // Ground
  const cube = new THREE.BoxGeometry( 190, 1, 70 );
  const ground = makeShapeInstance(cube, 0x7ca3ff);
  ground.rotation.y = Math.PI;
  ground.scale.y = 12;
  ground.scale.z = 2;
  ground.position.y = -5;

  // Moon
  const icosahedron = new THREE.IcosahedronGeometry( 20, 1 );
  makeShapeInstance(icosahedron, 0xfefff0, 0, 500, 25);
  // Moonlight lightsource 1 (DirectionalLight)
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(1, 13, 5);
  light.target.position.set(0, 11, 0);
  scene.add(light);
  scene.add(light.target);

  // Trees Background with texture
	const texture = new THREE.TextureLoader().load( 'assets/treeBark.jpg' );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 7);
  const cylinder = new THREE.CylinderGeometry( 2, 2, 180, 8 );
  for (let z=-34; z < 36; z+=4) 
  {
    makeTextureShape(cylinder, texture, -95, 90, z);
    makeTextureShape(cylinder, texture, 95, 90, z);
  }
  for (let x=-90; x <= 90; x+=4) 
  {
    makeTextureShape(cylinder, texture, x, 90, -34);
  }

  // Heart
  const shape = new THREE.Shape();
  const x = -2.5;
  const y = -5;
  shape.moveTo(x + 2.5, y + 2.5);
  shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
  shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
  shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
  shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
  shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
  shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

  const extrudeSettings = 
  {
    steps: 1, 
    depth: 2.1,
    bevelEnabled: true,
    bevelThickness: 0.80,
    bevelSize: 0.80,
    bevelSegments: 3, 
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial(
  {
    color: 0xfa1919,
    emissive: 0xfa1919,
    emissiveIntensity: 5.0,
  });
  heart = new THREE.Mesh(geometry, material);
  scene.add(heart);
  heart.position.x = 36;
  heart.position.y = 6;
  heart.position.z = 20;
  heart.rotation.x = Math.PI;
  heart.scale.setScalar(0.25);
  // heart lightsource 2 (PointLight)
  heartLight = new THREE.PointLight(0xfa0505, 700);
  heartLight.position.set(36, 4, 20);
  scene.add(heartLight);

  // Street Lamp with texture
  {
    const lampPosX = 70;
    const lampPosz = -20;
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader().load('assets/models/streetLamp/streetLamp.mtl', (mtl) => 
    {
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load('assets/models/streetLamp/streetLamp.obj', (root) => 
      { 
        objLoader.materials.materials.Glass.color.set(0xffffff);
        scene.add(root); 
        root.scale.setScalar(1.9);
        root.position.x = lampPosX;
        root.position.y = -.5;
        root.position.z = lampPosz;
        root.rotation.y = Math.PI;
      });
    });
    // Street Lamp lightsource 3 (SpotLight) 
    const lampLight = new THREE.SpotLight(0xFFFFFF, 180);
    lampLight.position.set( lampPosX-12, 16, lampPosz );
	  lampLight.target.position.set( lampPosX-12, 0, lampPosz );
    lampLight.angle = Math.PI;
    scene.add(lampLight);
    scene.add(lampLight.target);
  }

  // House with texture
  {
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader().load('assets/models/house/house.mtl', (mtl) => 
    {
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load('assets/models/house/house.obj', (root) => 
      { 
        scene.add(root); 
        root.scale.setScalar(3);
        root.position.x = 35;
        root.position.z = -30;
        root.rotation.y = Math.PI;
      });
    });
  }

  // Snow terrain with texture
  {
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader().load('assets/models/snow/SnowTerrain.mtl', (mtl) => 
    {
      mtl.preload();
      objLoader.setMaterials(mtl);
      objLoader.load('assets/models/snow/SnowTerrain.obj', (root) => 
      { 
        scene.add(root);
        root.scale.x = 3;
        root.scale.y = 2.5; 
        root.scale.z = 1;
        root.position.y = -2;
        root.rotation.y = Math.PI;
      });
    });
  }

  addSnowFlakes();

  // Flowey
  {
    const points = [];
    for ( let i = 0; i < 10; ++ i ) 
    {
      points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 3 + 3, ( i - 5 ) * .8 ) );
    }
    const baseGeom = new THREE.LatheGeometry( points, 22, Math.PI * 0.86, Math.PI * 2.00 );
    const base = makeStandardShapeInstance(baseGeom, 0x6a351b, 36, .4, 10);
    base.rotation.x = Math.PI;
    base.scale.setScalar(.2);
    
    const path = new CustomSinCurve( 4 );
    const stemGeom = new THREE.TubeGeometry( path, 71, 1.6, 17, false );
    const stem = makeStandardShapeInstance(stemGeom, 0x21a633, 36.9, 2.3, 10);
    stem.scale.setScalar(.3);
    stem.scale.x = .4;
    stem.rotation.z = Math.PI/1.8;

    const headGeom = new THREE.TorusGeometry( 1.3, 5.9, 30, 59 );
    const head = makeStandardShapeInstance(headGeom, 0xf9fbea, 36.9, 5.5, 10);
    head.scale.setScalar(.2);
    head.scale.y = .25;
    head.scale.z = .18;

    const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
    const extrudeSettings = 
    {
      steps:   6,  
      depth:  1.0,  
      bevelEnabled: true,  
      bevelThickness: 1.09,  
      bevelSize: 3.00,  
      bevelSegments: 8,  
    };
    const petalGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    petals = 
    [
      makeStandardShapeInstance(petalGeom, 0xe3e02b, 38.2, 4.5, 10.5),
      makeStandardShapeInstance(petalGeom, 0xe3e02b, 38.5, 6, 10.5),
      makeStandardShapeInstance(petalGeom, 0xe3e02b, 37.5, 7.2, 10.5),
      makeStandardShapeInstance(petalGeom, 0xe3e02b, 36, 7.2, 10.5),
      makeStandardShapeInstance(petalGeom, 0xe3e02b, 35.3, 6, 10.5),
      makeStandardShapeInstance(petalGeom, 0xe3e02b, 35.5, 4.48, 10.5)
    ];
    for (let i=0; i < petals.length; i++) 
    {
      petals[i].scale.setScalar(.11);
    }
    petals[0].rotation.z = Math.PI/4;
    petals[1].rotation.z = Math.PI/2;
    petals[2].rotation.z = Math.PI/1.2;
    petals[3].rotation.z = -Math.PI/1.2;
    petals[4].rotation.z = -Math.PI/2;
    petals[5].rotation.z = -Math.PI/4;

    const eyeGeom = new THREE.SphereGeometry( 3.0, 27, 27 );
    const leftEye = makeStandardShapeInstance(eyeGeom, 0x000000, 36.5, 5.7, 11);
    leftEye.scale.setScalar(.05);
    leftEye.scale.y = .2;
    const rightEye = makeStandardShapeInstance(eyeGeom, 0x000000, 37.3, 5.7, 11);
    rightEye.scale.setScalar(.05);
    rightEye.scale.y = .2;

    const mouthGeom = new THREE.TorusGeometry( 4.2, 1.0, 9, 16 );
    const mouth = makeStandardShapeInstance(mouthGeom, 0x000000, 36.9, 4.8, 11);
    mouth.scale.setScalar(.02);
    mouth.scale.x = .1;
    mouth.rotation.x = Math.PI/2;
    const lowerMouth = makeStandardShapeInstance(mouthGeom, 0x000000, 36.9, 4.63, 10.9);
    lowerMouth.scale.setScalar(.02);
    lowerMouth.scale.x = .078;
    lowerMouth.rotation.x = Math.PI/2;
    const leftSideMouth = makeStandardShapeInstance(mouthGeom, 0x000000, 37.4, 4.8, 10.94);
    leftSideMouth.scale.setScalar(.008);
    leftSideMouth.scale.x = .05;
    leftSideMouth.scale.z = .02;
    leftSideMouth.rotation.x = Math.PI/2;
    leftSideMouth.rotation.y = Math.PI/4;
    const leftDimple = makeStandardShapeInstance(mouthGeom, 0x000000, 37.56, 5, 10.95);
    leftDimple.scale.setScalar(.008);
    leftDimple.scale.x = .02;
    leftDimple.scale.z = .02;
    leftDimple.rotation.x = Math.PI/2;
    leftDimple.rotation.y = -Math.PI/2;
    const rightSideMouth = makeStandardShapeInstance(mouthGeom, 0x000000, 36.4, 4.8, 10.94);
    rightSideMouth.scale.setScalar(.008);
    rightSideMouth.scale.x = .05;
    rightSideMouth.scale.z = .02;
    rightSideMouth.rotation.x = -Math.PI/2;
    rightSideMouth.rotation.y = Math.PI/4;
    const rightDimple = makeStandardShapeInstance(mouthGeom, 0x000000, 36.24, 5, 10.94);
    rightDimple.scale.setScalar(.008);
    rightDimple.scale.x = .02;
    rightDimple.scale.z = .02;
    rightDimple.rotation.x = Math.PI/2;
    rightDimple.rotation.y = -Math.PI/2;
  }

}

function animate(time) 
{
  time *= 0.001;  // convert time to seconds

  // Set the repeat and offset properties of the background texture
  // to keep the image's aspect correct
  // Note the image may not have loaded yet
  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
  const imageAspect = sky.image ? sky.image.width / sky.image.height : 1;
  const aspect = imageAspect / canvasAspect;
  sky.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
  sky.repeat.x = aspect > 1 ? 1 / aspect : 1;
  sky.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
  sky.repeat.y = aspect > 1 ? 1 : aspect;

  // Heart and Heartlight animation
  heart.position.y = 10 + Math.sin(2*time + 10);
  heartLight.position.y = 6 + Math.sin(2*time + 10);

  petals[0].rotation.y = Math.sin(1.5*time)/4;
  petals[1].rotation.y = Math.sin(1.3*time)/4;
  petals[2].rotation.y = Math.sin(1.7*time)/4;
  petals[3].rotation.y = Math.sin(1.2*time)/4;
  petals[4].rotation.y = Math.sin(1.4*time)/4;
  petals[5].rotation.y = Math.sin(1.6*time)/4;

  updateParticles();
  
  controls.update(2);
  renderer.render( scene, camera );
}

function main() 
{
  setUpCamera();

  renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  setUpScene();

  renderer.setAnimationLoop( animate );
}

main();