import * as THREE from "three";

class World {
  constructor(scene) {
    this.scene = scene;
    this.objects = []; // For collision detection if needed
  }

  create() {
    this.createGround();
    this.createTrees();
    this.createBuildings();
    this.createRocks();
    this.createFence();
    this.createLighting();
    this.createSky();
  }

  createGround() {
    // Main grass ground
    const planeGeom = new THREE.PlaneGeometry(100, 100, 20, 20);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x3a8c3a,
      roughness: 0.9,
      flatShading: true,
    });

    // Add some height variation
    const vertices = planeGeom.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] += Math.random() * 0.3;
    }
    planeGeom.computeVertexNormals();

    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    this.scene.add(plane);

    // Path/road
    const pathGeom = new THREE.PlaneGeometry(4, 60);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 1,
    });
    const path = new THREE.Mesh(pathGeom, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.2;
    this.scene.add(path);
  }

  createTrees() {
    const treePositions = [
      [-15, -10],
      [-18, 5],
      [-12, 15],
      [-20, -20],
      [15, -12],
      [18, 8],
      [12, 20],
      [20, -18],
      [-25, 0],
      [25, 0],
      [-10, -25],
      [10, 25],
    ];

    treePositions.forEach(([x, z]) => {
      this.createTree(x, z);
    });
  }

  createTree(x, z) {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 1;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage layers
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });

    const foliage1 = new THREE.Mesh(
      new THREE.ConeGeometry(2, 3, 8),
      foliageMat
    );
    foliage1.position.y = 3;
    foliage1.castShadow = true;
    tree.add(foliage1);

    const foliage2 = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 2.5, 8),
      foliageMat
    );
    foliage2.position.y = 4.5;
    foliage2.castShadow = true;
    tree.add(foliage2);

    const foliage3 = new THREE.Mesh(
      new THREE.ConeGeometry(1, 2, 8),
      foliageMat
    );
    foliage3.position.y = 5.8;
    foliage3.castShadow = true;
    tree.add(foliage3);

    tree.position.set(x, 0, z);
    tree.rotation.y = Math.random() * Math.PI;
    this.scene.add(tree);
    this.objects.push(tree);
  }

  createBuildings() {
    // Small cabin
    this.createCabin(-8, -8);

    // Tower
    this.createTower(10, 10);

    // Wall ruins
    this.createRuins(15, -15);
  }

  createCabin(x, z) {
    const cabin = new THREE.Group();

    // Base
    const baseGeom = new THREE.BoxGeometry(5, 3, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x6b4423 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 1.5;
    base.castShadow = true;
    cabin.add(base);

    // Roof
    const roofGeom = new THREE.ConeGeometry(4, 2, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    cabin.add(roof);

    // Door
    const doorGeom = new THREE.BoxGeometry(1, 1.8, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 });
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(0, 0.9, 2.01);
    cabin.add(door);

    cabin.position.set(x, 0, z);
    this.scene.add(cabin);
    this.objects.push(cabin);
  }

  createTower(x, z) {
    const tower = new THREE.Group();

    // Tower body
    const bodyGeom = new THREE.CylinderGeometry(2, 2.5, 8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 4;
    body.castShadow = true;
    tower.add(body);

    // Tower top
    const topGeom = new THREE.ConeGeometry(2.8, 3, 8);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = 9.5;
    top.castShadow = true;
    tower.add(top);

    // Flag
    const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 2);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3d });
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.y = 12;
    tower.add(pole);

    const flagGeom = new THREE.PlaneGeometry(1.5, 1);
    const flagMat = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      side: THREE.DoubleSide,
    });
    const flag = new THREE.Mesh(flagGeom, flagMat);
    flag.position.set(0.75, 12.3, 0);
    tower.add(flag);

    tower.position.set(x, 0, z);
    this.scene.add(tower);
    this.objects.push(tower);
  }

  createRuins(x, z) {
    const ruins = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x696969 });

    // Broken walls
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.5), wallMat);
    wall1.position.set(0, 1.5, 0);
    wall1.castShadow = true;
    ruins.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 4), wallMat);
    wall2.position.set(2.75, 1, 2);
    wall2.castShadow = true;
    ruins.add(wall2);

    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 4), wallMat);
    wall3.position.set(-2.75, 2, 2);
    wall3.castShadow = true;
    ruins.add(wall3);

    ruins.position.set(x, 0, z);
    ruins.rotation.y = Math.PI / 6;
    this.scene.add(ruins);
    this.objects.push(ruins);
  }

  createRocks() {
    const rockPositions = [
      [-5, 20],
      [8, -22],
      [-22, 12],
      [22, -5],
      [0, 15],
      [-3, -18],
      [25, 20],
      [-25, -25],
    ];

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x5a5a5a,
      roughness: 0.9,
    });

    rockPositions.forEach(([x, z]) => {
      const size = 0.5 + Math.random() * 1.5;
      const rockGeom = new THREE.DodecahedronGeometry(size, 0);
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(x, size * 0.4, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.scene.add(rock);
      this.objects.push(rock);
    });
  }

  createFence() {
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });

    // Create fence posts along the path
    for (let i = -25; i <= 25; i += 5) {
      [-2.5, 2.5].forEach((offset) => {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6),
          fenceMat
        );
        post.position.set(offset, 0.6, i);
        post.castShadow = true;
        this.scene.add(post);
      });
    }
  }

  createLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambient);

    // Directional sun light
    const sun = new THREE.DirectionalLight(0xffff88, 1);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    this.scene.add(sun);

    // Hemisphere light for sky/ground color
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x3a8c3a, 0.6);
    this.scene.add(hemi);
  }

  createSky() {
    // Simple sky dome
    const skyGeom = new THREE.SphereGeometry(80, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeom, skyMat);
    this.scene.add(sky);

    // Sun sphere
    const sunGeom = new THREE.SphereGeometry(3, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff88 });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.position.set(30, 40, 20);
    this.scene.add(sunMesh);

    // Clouds
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Group();
      for (let j = 0; j < 5; j++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(2 + Math.random() * 2, 8, 8),
          cloudMat
        );
        puff.position.set(j * 2.5 - 5, Math.random(), Math.random() * 2);
        cloud.add(puff);
      }
      cloud.position.set(
        Math.random() * 80 - 40,
        25 + Math.random() * 10,
        Math.random() * 80 - 40
      );
      this.scene.add(cloud);
    }
  }

  // Get objects for collision detection
  getColliders() {
    return this.objects;
  }
}

export default World;
