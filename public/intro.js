// import "https://unpkg.com/three@0.133.0/examples/js/loaders/GLTFLoader.js";
// import "https://unpkg.com/three@0.133.0/examples/js/loaders/DRACOLoader.js";

// // Canvas
// const canvas = document.querySelector("canvas.webgl");

// // Scene
// const scene = new THREE.Scene();

// /**
//  * Models
//  */
// const dracoLoader = new THREE.DRACOLoader();
// dracoLoader.setDecoderPath("./draco/");
// const gltfLoader = new THREE.GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);

// gltfLoader.load("./models/Cube/untitled3.glb", (gltf) => {
//   // gltf.position.set(0, 0, 0);
//   scene.add(gltf.scene);
// });

// /**
//  * Floor
//  */
// // const floor = new THREE.Mesh(
// //   new THREE.PlaneBufferGeometry(10, 10),
// //   new THREE.MeshStandardMaterial({
// //     color: "#444444",
// //     metalness: 0,
// //     roughness: 0.5,
// //   })
// // );
// // floor.receiveShadow = true;
// // floor.rotation.x = -Math.PI * 0.5;
// // scene.add(floor)

// /**
//  * Lights
//  */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
// directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.set(1024, 1024);
// directionalLight.shadow.camera.far = 15;
// directionalLight.shadow.camera.left = -7;
// directionalLight.shadow.camera.top = 7;
// directionalLight.shadow.camera.right = 7;
// directionalLight.shadow.camera.bottom = -7;
// directionalLight.position.set(-5, 5, 0);
// scene.add(directionalLight);

// /**
//  * Sizes
//  */
// const sizes = {
//   width: 300,
//   height: 300,
// };

// /**
//  * Camera
//  */
// // Base camera
// const camera = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   100
// );
// camera.position.set(-3, 2, 4);
// scene.add(camera);

// /**
//  * Renderer
//  */
// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
// });
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.setSize(sizes.width, sizes.height);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// /**
//  * Animate
//  */

// const tick = () => {
//   // Render
//   renderer.render(scene, camera);

//   // Call tick again on the next frame
//   window.requestAnimationFrame(tick);
// };

// tick();
