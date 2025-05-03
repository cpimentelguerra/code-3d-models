const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  2,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.y = 10;
camera.position.x = 20;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Color del fondo inicial
const params = {
  color: '#ffffff'
};
scene.background = new THREE.Color(params.color); 

// Seleccion del color de fondo
const gui = new dat.GUI();
gui.addColor(params, 'color').onChange(function(value) {
  scene.background = new THREE.Color(value);
});

// Botón pantalla completa
const actions = {
  fullscreen: function () {
    const elem = renderer.domElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }
};

gui.add(actions, 'fullscreen').name('Pantalla completa');

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const loader = new THREE.GLTFLoader();
loader.load(
  "./model.glb",
  function (gltf) {
    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        const oldMat = child.material;
        child.material = new THREE.MeshBasicMaterial({
          map: oldMat.map || null,
          color: oldMat.color || 0xffffff,
        });
      }
    });

    // Centrar modelo
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);

    // Ajustar cámara para que encuadre todo
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
    camera.position.set(0, maxDim * 0.2, cameraZ * 1.2); // Vista ligeramente superior
    camera.lookAt(0, 0, 0);

    // Actualizar controles
    controls.target.set(0, 0, 0);
    controls.update();
  },
  undefined,
  function (error) {
    console.error("GLB Load Error:", error);
  }
);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
