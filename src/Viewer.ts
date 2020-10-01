import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

var link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function saveString(text, filename) {
  save(new Blob([text], { type: "text/plain" }), filename);
}

function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: "application/octet-stream" }), filename);
}

export class Viewer {
  private container: HTMLDivElement;

  private camera: THREE.PerspectiveCamera;

  private scene: THREE.Scene;

  private renderer: THREE.WebGLRenderer;

  private controls: OrbitControls;

  private light: THREE.DirectionalLight;

  private loader: TDSLoader;

  private exporter: GLTFExporter;

  private initialRotate = 0;

  constructor(container: HTMLDivElement) {
    this.container = container;
  }

  public init(path: string, materialMapping: any) {
    this.loader = new TDSLoader();
    this.exporter = new GLTFExporter();

    this.initCamera();
    this.initScene();
    this.initLight();
    this.loadModel(path, materialMapping);
    this.initRenderer();
    this.initWindowEvents();
    this.startAnimation();
  }

  public loadModel(
    path: string,
    materialMapping: { objects: string[]; texture: string }[]
  ): void {
    const textureLoader = new THREE.TextureLoader();

    this.loader.load(path, (object) => {
      object.scale.set(0.005, 0.005, 0.005);
      object.rotation.x = degrees_to_radians(-90);
      object.position.y = -0.88;
      object.name = "furniture";

      object.traverse(function (child: THREE.Mesh) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          materialMapping.forEach((materialMap) => {
            if (!materialMap.objects.includes(child.name)) {
              return;
            }

            child.material = new THREE.MeshBasicMaterial({
              map: textureLoader.load(materialMap.texture),
            });
          });
        }
      });

      this.scene.add(object);

      const center = new THREE.Box3();
      center.setFromObject(object);

      const objectCenter = new THREE.Vector3();
      center.getCenter(objectCenter);

      let direction = new THREE.Vector3();
      object.getWorldPosition(direction);

      const rotation = new THREE.Vector3();
      object.getWorldDirection(rotation);

      this.camera.lookAt(direction);
      this.camera.position.z = 8;
      this.camera.position.y = 2;
      this.controls.target = objectCenter;

      this.controls.update();
    });
  }

  public changeTexture(textureMap: { objects: string[]; texture: string }) {
    const object = this.scene.getObjectByName("furniture");
    const textureLoader = new THREE.TextureLoader();

    object.traverse(function (child: THREE.Mesh) {
      if (child.isMesh) {
        if (!textureMap.objects.includes(child.name)) {
          return;
        }

        child.material = new THREE.MeshBasicMaterial({
          map: textureLoader.load(textureMap.texture),
        });
      }
    });
  }

  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.container.clientWidth / this.container.clientHeight,
      0.3,
      1000
    );

    this.camera.position.z = 5;
    this.camera.position.x = 0;
  }

  private initLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.camera.visible = false;
    dirLight.shadow.bias = 0.0001;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    this.scene.add(dirLight);

    //const helper = new THREE.CameraHelper( dirLight.shadow.camera );
    // this.scene.add( helper );
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f1f1);
    this.scene.fog = new THREE.Fog(0xf1f1f1);

    const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 10, 10);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      shininess: 0,
      side: THREE.DoubleSide
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;

    this.scene.add(floor);
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minPolarAngle = Math.PI / 3;
    this.controls.enableDamping = true;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;
    this.controls.enablePan = true;
    this.controls.dampingFactor = 0.1;
    this.controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
    this.controls.autoRotateSpeed = 1; // 30
    this.controls.update();
  }

  private initWindowEvents() {
    window.addEventListener(
      "resize",
      () => {
        this.onResize();
      },
      false
    );
  }

  private startAnimation() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    //this.camera.updateProjectionMatrix();

    requestAnimationFrame(() => {
      this.startAnimation();
    });
  }

  private onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  public export() {
    this.exporter.parse(
      this.scene.getObjectByName("furniture"),
      (result) => {
        if (result instanceof ArrayBuffer) {
          saveArrayBuffer(result, "export.glb");
        } else {
          var output = JSON.stringify(result, null, 2);
          saveString(output, "export.gltf");
        }
      },
      {
        trs: false,
        onlyVisible: true,
        truncateDrawRange: true,
        binary: false,
      }
    );
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public showHelpers(): void {
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.name = "axisHelper";
    this.scene.add(axesHelper);

    const boxHelper = new THREE.BoxHelper(
      this.scene.getObjectByName("furniture")
    );

    boxHelper.name = "boxHelper";
    this.scene.add(boxHelper);

    const gridHelper = new THREE.GridHelper(10, 10);

    boxHelper.name = "gridHelper";
    this.scene.add(gridHelper);
  }

  public removeHelpers(): void {
    this.scene.remove(this.scene.getObjectByName("axisHelper"));
    this.scene.remove(this.scene.getObjectByName("boxHelper"));
    this.scene.remove(this.scene.getObjectByName("gridHelper"));
  }
}
