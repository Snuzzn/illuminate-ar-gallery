import { ARButton } from "./ARButton.js";
import "https://unpkg.com/three@0.133.0/examples/js/loaders/GLTFLoader.js";
import "https://unpkg.com/three@0.133.0/examples/js/loaders/DRACOLoader.js";
import "https://cdn.jsdelivr.net/npm/@splidejs/splide@3.6.12/dist/js/splide.min.js";
import "https://cdn.jsdelivr.net/npm/tweakpane@3.0.5/dist/tweakpane.min.js";
// source of webxr api code: https://glitch.com/edit/#!/intro-to-webxr?path=README.md%3A1%3A0
// === INTRO PAGE ===

// new Splide(".splide").mount();

let vh = window.innerHeight;
document.body.style.height = `${vh}px`;

window.addEventListener("resize", () => {
  let vh = window.innerHeight;
  document.body.style.minHeight = `${vh}px`;
});

// === AR ===

let stabilised = false;
let container;
let camera, scene, renderer;
let reticle;
let controller;
let pane;

const PARAMS = {
  x: 0,
  y: 0,
  z: -0.5,
};

setupGui();
init();
animate();

function setupGui() {
  // first we create the gui panel
  pane = new Tweakpane.Pane();
  pane.containerElem_.style.zIndex = "1000000"; // we need to set the zIndex so it shows up on desktop correctly

  // finally you customize the parameters
  // min is the minimum value the slider will go, max is the max value the slider will go, step is the increase at each change in the slider
  // remember these values are in meters in WebXR
  pane.addInput(PARAMS, "x", { min: -5, max: 5, step: 0.1 });
  pane.addInput(PARAMS, "y", { min: -5, max: 5, step: 0.1 });
  pane.addInput(PARAMS, "z", { min: -5, max: 5, step: 0.1 });

  // more types of params and options can be found:
  // https://cocopon.github.io/tweakpane/
}

function tick() {
  // Render
  renderer.render(scene, camera);
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
}

function init() {
  container = document.createElement("div");
  container.id = "AR_Container";
  document.body.appendChild(container);

  // container.style.display = "none";

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  controller = renderer.xr.getController(0);
  // controller.addEventListener("select", onSelect);
  scene.add(controller);

  addReticleToScene();

  const button = ARButton.createButton(renderer, {
    optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],
    requiredFeatures: ["hit-test"],
  });
  renderer.domElement.style.display = "none";

  document.body.appendChild(button);

  // const spawnBtn = document.getElementById("spawnBtn");
  // spawnBtn.addEventListener("click", onSelect);

  window.addEventListener("resize", onWindowResize, false);
}

function addReticleToScene() {
  const geometry = new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(
    -Math.PI / 2
  );
  const material = new THREE.MeshBasicMaterial();

  reticle = new THREE.Mesh(geometry, material);

  // we will calculate the position and rotation of this reticle every frame manually
  // in the render() function so matrixAutoUpdate is set to false
  reticle.matrixAutoUpdate = false;
  reticle.visible = false; // we start with the reticle not visible
  scene.add(reticle);

  // optional axis helper you can add to an object
  // reticle.add(new THREE.AxesHelper(1));
}

export function onSelect() {
  if (reticle.visible) {
    // cone added at the point of a hit test
    const geometry = new THREE.CylinderBufferGeometry(0, 0.05, 0.2, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff * Math.random(),
    });
    const mesh = new THREE.Mesh(geometry, material);

    // set the position of the cylinder based on where the reticle is
    mesh.position.setFromMatrixPosition(reticle.matrix);
    mesh.quaternion.setFromRotationMatrix(reticle.matrix);

    // let modelPath = "./models/Fox/glTF/Fox.gltf";
    // let modelPath = "./models/Fox/glTF-Binary/Fox.glb";
    // let modelPath = "./models/Cube/untitled3.glb";
    // let modelPath = "./models/Duck/glTF-Draco/Duck.gltf";
    // modelPath = "./models/Crystallise/Crystallise2-draco.glb";
    let modelPath = document.getElementById("modelPath").innerText;
    console.log(modelPath);

    let size = 1;

    // set up loader
    const gltfLoader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath("./draco/");
    gltfLoader.setDRACOLoader(dracoLoader);

    // load model
    gltfLoader.load(modelPath, (gltf) => {
      const model = gltf.scene;
      model.scale.set(size, size, size);
      model.position.setFromMatrixPosition(reticle.matrix);
      // if (modelPath === "./models/Jellyfish/scene.gltf") model.position.y = 0.2;
      model.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      scene.add(model);

      console.log(scene);
    });
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
  tick();
}

// hit testing provides the position and orientation of the intersection point, but nothing about the surfaces themselves.
let hitTestSource = null;
let localSpace = null;
let hitTestSourceInitialized = false;

// This function gets called just once to initialize a hitTestSource
// The purpose of this function is to get a) a hit test source and b) a reference space
async function initializeHitTestSource() {
  const session = renderer.xr.getSession(); // XRSession

  // Reference spaces express relationships between an origin and the world.

  // For hit testing, we use the "viewer" reference space,
  // which is based on the device's pose at the time of the hit test.
  const viewerSpace = await session.requestReferenceSpace("viewer");
  hitTestSource = await session.requestHitTestSource({
    space: viewerSpace,
  });

  // We're going to use the reference space of "local" for drawing things.
  // which gives us stability in terms of the environment.
  // read more here: https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace
  localSpace = await session.requestReferenceSpace("local");

  // set this to true so we don't request another hit source for the rest of the session
  hitTestSourceInitialized = true;

  // In case we close the AR session by hitting the button "End AR"
  session.addEventListener("end", () => {
    hitTestSourceInitialized = false;
    hitTestSource = null;
  });
}

// the callback from 'setAnimationLoop' can also return a timestamp
// and an XRFrame, which provides access to the information needed in
// order to render a single frame of animation for an XRSession describing
// a VR or AR sccene.
function render(timestamp, frame) {
  if (frame) {
    // 1. create a hit test source once and keep it for all the frames
    // this gets called only once
    if (!hitTestSourceInitialized) {
      initializeHitTestSource();
    }

    // 2. get hit test results
    if (hitTestSourceInitialized) {
      // we get the hit test results for a particular frame
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (!stabilised && hitTestResults.length > 0) {
        // stop displaying stabilising gif
        const gif = document.getElementById("stabilising");
        gif.style.display = "none";
        stabilised = true;
        // display spawnBtn
        spawnBtn.style.display = "block";
        // display projectBtns
        // const projectBtns = document.getElementById("projectBtns");
        // projectBtns.style.display = "flex";
      }

      // XRHitTestResults The hit test may find multiple surfaces. The first one in the array is the one closest to the camera.
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        // Get a pose from the hit test result. The pose represents the pose of a point on a surface.
        const pose = hit.getPose(localSpace);

        reticle.visible = true;
        // Transform/move the reticle image to the hit test position
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }

    renderer.render(scene, camera);
  }
}
