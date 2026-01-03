import * as THREE from "three";

class World {
    constructor(scene) {
        this.scene = scene;
        this.objects = []; // For collision detection
        this.coverSpots = []; // Tactical cover positions

        // Shared materials for performance
        this.materials = {};
        this.initMaterials();
    }

    initMaterials() {
        // Pre-create shared materials
        this.materials = {
            grass: new THREE.MeshStandardMaterial({
                color: 0x4a7c3f,
                roughness: 0.95,
                flatShading: true,
            }),
            dirt: new THREE.MeshStandardMaterial({
                color: 0x6b5344,
                roughness: 1,
            }),
            rock: new THREE.MeshStandardMaterial({
                color: 0x5c5c5c,
                roughness: 0.85,
            }),
            concrete: new THREE.MeshStandardMaterial({
                color: 0x7a7a7a,
                roughness: 0.9,
            }),
            wood: new THREE.MeshStandardMaterial({
                color: 0x8b6914,
                roughness: 0.8,
            }),
            woodDark: new THREE.MeshStandardMaterial({
                color: 0x4a3520,
                roughness: 0.85,
            }),
            metal: new THREE.MeshStandardMaterial({
                color: 0x4a4a4a,
                roughness: 0.4,
                metalness: 0.8,
            }),
            metalRusted: new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.9,
                metalness: 0.3,
            }),
            sandbag: new THREE.MeshStandardMaterial({
                color: 0xc2a864,
                roughness: 1,
            }),
            foliage: new THREE.MeshStandardMaterial({
                color: 0x2d5a27,
                roughness: 0.9,
            }),
            foliageDark: new THREE.MeshStandardMaterial({
                color: 0x1e4020,
                roughness: 0.9,
            }),
            brick: new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.9,
            }),
            roofTile: new THREE.MeshStandardMaterial({
                color: 0x6b3a2a,
                roughness: 0.85,
            }),
            water: new THREE.MeshStandardMaterial({
                color: 0x3d6b8a,
                roughness: 0.1,
                metalness: 0.3,
                transparent: true,
                opacity: 0.85,
            }),
        };
    }

    create() {
        this.createAtmosphere();
        this.createGround();
        this.createTacticalAreas();
        this.createBuildings();
        this.createNaturalCover();
        this.createVegetation();
        this.createWaterFeature();
        this.createLighting();
        this.createSky();
    }

    createAtmosphere() {
        // Atmospheric fog for depth and mood
        this.scene.fog = new THREE.FogExp2(0x87919e, 0.015);
    }

    createGround() {
        // Main terrain with height variation
        const terrainSize = 120;
        const segments = 40;
        const terrainGeom = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);

        // Create height map for varied terrain
        const vertices = terrainGeom.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];

            // Base noise
            let height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
            height += Math.random() * 0.2;

            // Create slight hills at edges
            const distFromCenter = Math.sqrt(x * x + y * y);
            if (distFromCenter > 35) {
                height += (distFromCenter - 35) * 0.05;
            }

            // Flatten center area for gameplay
            if (distFromCenter < 20) {
                height *= 0.3;
            }

            vertices[i + 2] = height;
        }
        terrainGeom.computeVertexNormals();

        const terrain = new THREE.Mesh(terrainGeom, this.materials.grass);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        this.scene.add(terrain);

        // Dirt paths - main road
        this.createPath(0, 0, 0, 80, 5);
        // Cross path
        this.createPath(0, 0, Math.PI / 2, 60, 4);
        // Diagonal path
        this.createPath(15, -15, Math.PI / 4, 40, 3);
    }

    createPath(x, z, rotation, length, width) {
        const pathGeom = new THREE.PlaneGeometry(width, length);
        const path = new THREE.Mesh(pathGeom, this.materials.dirt);
        path.rotation.x = -Math.PI / 2;
        path.rotation.z = rotation;
        path.position.set(x, 0.05, z);
        path.receiveShadow = true;
        this.scene.add(path);
    }

    createTacticalAreas() {
        // Central crossroads cover
        this.createSandbagWall(5, 5, 0);
        this.createSandbagWall(-5, -5, Math.PI);
        this.createSandbagWall(5, -5, -Math.PI / 2);
        this.createSandbagWall(-5, 5, Math.PI / 2);

        // Crate clusters for cover
        this.createCrateCluster(12, 3);
        this.createCrateCluster(-12, -3);
        this.createCrateCluster(3, -15);
        this.createCrateCluster(-3, 15);

        // Concrete barriers
        this.createBarrier(20, 0, 0);
        this.createBarrier(-20, 0, 0);
        this.createBarrier(0, 20, Math.PI / 2);
        this.createBarrier(0, -20, Math.PI / 2);

        // Military bunkers
        this.createBunker(-25, -25, Math.PI / 4);
        this.createBunker(25, 25, (-Math.PI / 4) * 3);

        // Trenches
        this.createTrench(30, 0, 0, 15);
        this.createTrench(-30, 0, 0, 15);

        // Vehicle wrecks for cover
        this.createVehicleWreck(18, -12, Math.PI / 6);
        this.createVehicleWreck(-15, 18, -Math.PI / 3);

        // Watchtower platforms
        this.createWatchtower(35, 35);
        this.createWatchtower(-35, -35);
    }

    createSandbagWall(x, z, rotation) {
        const wall = new THREE.Group();

        // Create sandbags using instanced geometry for performance
        const bagGeom = new THREE.BoxGeometry(0.8, 0.35, 0.4);

        const positions = [
            // Bottom row
            [-0.8, 0.175, 0],
            [0, 0.175, 0],
            [0.8, 0.175, 0],
            // Second row (offset)
            [-0.4, 0.525, 0],
            [0.4, 0.525, 0],
            // Top row
            [-0.8, 0.875, 0],
            [0, 0.875, 0],
            [0.8, 0.875, 0],
        ];

        positions.forEach(([bx, by, bz]) => {
            const bag = new THREE.Mesh(bagGeom, this.materials.sandbag);
            bag.position.set(bx, by, bz);
            bag.rotation.y = Math.random() * 0.1 - 0.05;
            bag.castShadow = true;
            bag.receiveShadow = true;
            wall.add(bag);
        });

        // Add corner piece
        const cornerWall = wall.clone();
        cornerWall.rotation.y = Math.PI / 2;
        cornerWall.position.x = 1.2;
        wall.add(cornerWall);

        wall.position.set(x, 0, z);
        wall.rotation.y = rotation;
        this.scene.add(wall);
        this.objects.push(wall);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "low" });
    }

    createCrateCluster(x, z) {
        const cluster = new THREE.Group();

        const crateConfigs = [
            { size: [1.2, 1.2, 1.2], pos: [0, 0.6, 0] },
            { size: [1, 1, 1], pos: [1.3, 0.5, 0.3] },
            { size: [0.8, 0.8, 0.8], pos: [-0.9, 0.4, 0.5] },
            { size: [1, 0.6, 1], pos: [0.5, 0.3, -1.1] },
            { size: [1.2, 1.2, 1.2], pos: [-0.3, 1.8, 0] }, // Stacked
        ];

        crateConfigs.forEach(({ size, pos }) => {
            const crate = this.createCrate(size[0], size[1], size[2]);
            crate.position.set(...pos);
            crate.rotation.y = Math.random() * 0.3 - 0.15;
            cluster.add(crate);
        });

        cluster.position.set(x, 0, z);
        cluster.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(cluster);
        this.objects.push(cluster);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "medium" });
    }

    createCrate(w, h, d) {
        const crate = new THREE.Group();

        // Main body
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.materials.wood);
        body.castShadow = true;
        body.receiveShadow = true;
        crate.add(body);

        // Edge strips
        const stripMat = this.materials.woodDark;
        const stripSize = 0.05;

        // Vertical edges
        const stripGeom = new THREE.BoxGeometry(stripSize, h, stripSize);
        [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
        ].forEach(([sx, sz]) => {
            const strip = new THREE.Mesh(stripGeom, stripMat);
            strip.position.set((w / 2) * sx, 0, (d / 2) * sz);
            crate.add(strip);
        });

        return crate;
    }

    createBarrier(x, z, rotation) {
        const barrier = new THREE.Group();

        // Jersey barrier shape
        const shape = new THREE.Shape();
        shape.moveTo(-0.4, 0);
        shape.lineTo(-0.3, 0.8);
        shape.lineTo(-0.15, 0.8);
        shape.lineTo(-0.1, 0.4);
        shape.lineTo(0.1, 0.4);
        shape.lineTo(0.15, 0.8);
        shape.lineTo(0.3, 0.8);
        shape.lineTo(0.4, 0);
        shape.closePath();

        const extrudeSettings = {
            depth: 3,
            bevelEnabled: false,
        };

        const barrierGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const barrierMesh = new THREE.Mesh(barrierGeom, this.materials.concrete);
        barrierMesh.rotation.x = -Math.PI / 2;
        barrierMesh.position.z = -1.5;
        barrierMesh.castShadow = true;
        barrierMesh.receiveShadow = true;
        barrier.add(barrierMesh);

        // Add second barrier
        const barrier2 = barrierMesh.clone();
        barrier2.position.x = 1;
        barrier.add(barrier2);

        barrier.position.set(x, 0, z);
        barrier.rotation.y = rotation;
        this.scene.add(barrier);
        this.objects.push(barrier);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "low" });
    }

    createBunker(x, z, rotation) {
        const bunker = new THREE.Group();

        // Main structure
        const mainGeom = new THREE.BoxGeometry(6, 2.5, 5);
        const main = new THREE.Mesh(mainGeom, this.materials.concrete);
        main.position.y = 1.25;
        main.castShadow = true;
        main.receiveShadow = true;
        bunker.add(main);

        // Roof (angled)
        const roofGeom = new THREE.BoxGeometry(6.5, 0.4, 5.5);
        const roof = new THREE.Mesh(roofGeom, this.materials.concrete);
        roof.position.y = 2.7;
        roof.rotation.x = 0.05;
        roof.castShadow = true;
        bunker.add(roof);

        // Window slit
        const slitGeom = new THREE.BoxGeometry(4, 0.4, 0.6);
        const slitMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        const slit = new THREE.Mesh(slitGeom, slitMat);
        slit.position.set(0, 1.8, 2.5);
        bunker.add(slit);

        // Entrance
        const entranceGeom = new THREE.BoxGeometry(1.5, 2, 1);
        const entrance = new THREE.Mesh(entranceGeom, slitMat);
        entrance.position.set(0, 1, -2.5);
        bunker.add(entrance);

        // Sandbag reinforcement
        this.addSandbagReinforcement(bunker, 3.2, 0, 0, 0);
        this.addSandbagReinforcement(bunker, -3.2, 0, 0, Math.PI);

        bunker.position.set(x, 0, z);
        bunker.rotation.y = rotation;
        this.scene.add(bunker);
        this.objects.push(bunker);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "high" });
    }

    addSandbagReinforcement(parent, x, y, z, rotation) {
        const bags = new THREE.Group();
        const bagGeom = new THREE.BoxGeometry(0.6, 0.3, 0.35);

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const bag = new THREE.Mesh(bagGeom, this.materials.sandbag);
                bag.position.set(col * 0.65 - 0.325, row * 0.32 + 0.15, 0);
                bag.castShadow = true;
                bags.add(bag);
            }
        }

        bags.position.set(x, y, z);
        bags.rotation.y = rotation;
        parent.add(bags);
    }

    createTrench(x, z, rotation, length) {
        const trench = new THREE.Group();

        // Trench walls
        const wallGeom = new THREE.BoxGeometry(1, 1.5, length);

        const leftWall = new THREE.Mesh(wallGeom, this.materials.dirt);
        leftWall.position.set(-1.5, 0.75, 0);
        leftWall.castShadow = true;
        trench.add(leftWall);

        const rightWall = new THREE.Mesh(wallGeom, this.materials.dirt);
        rightWall.position.set(1.5, 0.75, 0);
        rightWall.castShadow = true;
        trench.add(rightWall);

        // Trench floor (darker)
        const floorGeom = new THREE.BoxGeometry(2, 0.1, length);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x3d2b1f,
            roughness: 1,
        });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.position.y = 0.05;
        floor.receiveShadow = true;
        trench.add(floor);

        // Wood supports
        const supportGeom = new THREE.BoxGeometry(0.15, 1.8, 0.15);
        for (let i = -length / 2 + 2; i < length / 2; i += 3) {
            [-1.2, 1.2].forEach((xPos) => {
                const support = new THREE.Mesh(supportGeom, this.materials.woodDark);
                support.position.set(xPos, 0.9, i);
                support.castShadow = true;
                trench.add(support);
            });
        }

        // Sandbag top
        const topBagGeom = new THREE.BoxGeometry(0.5, 0.25, 0.4);
        for (let i = -length / 2; i < length / 2; i += 0.55) {
            [-1.9, 1.9].forEach((xPos) => {
                const bag = new THREE.Mesh(topBagGeom, this.materials.sandbag);
                bag.position.set(xPos, 1.6, i);
                bag.castShadow = true;
                trench.add(bag);
            });
        }

        trench.position.set(x, -0.5, z);
        trench.rotation.y = rotation;
        this.scene.add(trench);
        this.coverSpots.push({ position: new THREE.Vector3(x, -0.5, z), type: "trench" });
    }

    createVehicleWreck(x, z, rotation) {
        const wreck = new THREE.Group();

        // Truck body
        const bodyGeom = new THREE.BoxGeometry(2.5, 1.5, 5);
        const body = new THREE.Mesh(bodyGeom, this.materials.metalRusted);
        body.position.y = 1.2;
        body.castShadow = true;
        body.receiveShadow = true;
        wreck.add(body);

        // Cab
        const cabGeom = new THREE.BoxGeometry(2.3, 1.2, 1.8);
        const cab = new THREE.Mesh(cabGeom, this.materials.metalRusted);
        cab.position.set(0, 2.1, -1.4);
        cab.castShadow = true;
        wreck.add(cab);

        // Wheels (flat/damaged)
        const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
        const wheelPositions = [
            [-1.3, 0.3, -1.8],
            [1.3, 0.3, -1.8],
            [-1.3, 0.3, 1.5],
            [1.3, 0.3, 1.5],
        ];
        wheelPositions.forEach(([wx, wy, wz]) => {
            const wheel = new THREE.Mesh(wheelGeom, this.materials.metal);
            wheel.position.set(wx, wy, wz);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            wreck.add(wheel);
        });

        // Damage - tilted slightly
        wreck.rotation.z = 0.1;
        wreck.rotation.x = 0.05;

        wreck.position.set(x, 0, z);
        wreck.rotation.y = rotation;
        this.scene.add(wreck);
        this.objects.push(wreck);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "high" });
    }

    createWatchtower(x, z) {
        const tower = new THREE.Group();

        // Legs
        const legGeom = new THREE.CylinderGeometry(0.15, 0.2, 6, 8);
        const legPositions = [
            [-1.5, -1.5],
            [-1.5, 1.5],
            [1.5, -1.5],
            [1.5, 1.5],
        ];
        legPositions.forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeom, this.materials.woodDark);
            leg.position.set(lx, 3, lz);
            leg.castShadow = true;
            tower.add(leg);
        });

        // Cross braces
        const braceGeom = new THREE.BoxGeometry(0.1, 0.1, 4.5);
        for (let h = 1; h < 5; h += 2) {
            [0, Math.PI / 2].forEach((rot) => {
                [-1.5, 1.5].forEach((offset) => {
                    const brace = new THREE.Mesh(braceGeom, this.materials.woodDark);
                    brace.position.set(rot === 0 ? offset : 0, h, rot === 0 ? 0 : offset);
                    brace.rotation.y = rot;
                    tower.add(brace);
                });
            });
        }

        // Platform
        const platformGeom = new THREE.BoxGeometry(4, 0.2, 4);
        const platform = new THREE.Mesh(platformGeom, this.materials.wood);
        platform.position.y = 6;
        platform.castShadow = true;
        platform.receiveShadow = true;
        tower.add(platform);

        // Railing
        const railGeom = new THREE.BoxGeometry(0.1, 1, 4);
        const railPositions = [
            [-1.9, 6.6, 0, 0],
            [1.9, 6.6, 0, 0],
            [0, 6.6, -1.9, Math.PI / 2],
            [0, 6.6, 1.9, Math.PI / 2],
        ];
        railPositions.forEach(([rx, ry, rz, rot]) => {
            const rail = new THREE.Mesh(railGeom, this.materials.woodDark);
            rail.position.set(rx, ry, rz);
            rail.rotation.y = rot;
            rail.castShadow = true;
            tower.add(rail);
        });

        // Roof
        const roofGeom = new THREE.ConeGeometry(3.5, 2, 4);
        const roof = new THREE.Mesh(roofGeom, this.materials.roofTile);
        roof.position.y = 8.2;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        tower.add(roof);

        // Ladder
        const ladderGroup = new THREE.Group();
        const ladderSideGeom = new THREE.BoxGeometry(0.08, 6, 0.08);
        [-0.3, 0.3].forEach((lx) => {
            const side = new THREE.Mesh(ladderSideGeom, this.materials.woodDark);
            side.position.x = lx;
            ladderGroup.add(side);
        });
        const rungGeom = new THREE.BoxGeometry(0.6, 0.06, 0.06);
        for (let r = -2.5; r < 3; r += 0.5) {
            const rung = new THREE.Mesh(rungGeom, this.materials.woodDark);
            rung.position.y = r;
            ladderGroup.add(rung);
        }
        ladderGroup.position.set(2, 3, 0);
        ladderGroup.rotation.z = 0.2;
        tower.add(ladderGroup);

        tower.position.set(x, 0, z);
        this.scene.add(tower);
        this.objects.push(tower);
        this.coverSpots.push({ position: new THREE.Vector3(x, 6, z), type: "elevated" });
    }

    createBuildings() {
        // Main warehouse
        this.createWarehouse(-20, 10);

        // Small cabin
        this.createCabin(20, -8);

        // Ruined building
        this.createRuinedBuilding(-8, -25);

        // Storage shed
        this.createShed(8, 28);
    }

    createWarehouse(x, z) {
        const warehouse = new THREE.Group();

        // Main structure
        const mainGeom = new THREE.BoxGeometry(12, 6, 8);
        const main = new THREE.Mesh(mainGeom, this.materials.concrete);
        main.position.y = 3;
        main.castShadow = true;
        main.receiveShadow = true;
        warehouse.add(main);

        // Roof
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-6.5, 0);
        roofShape.lineTo(0, 2.5);
        roofShape.lineTo(6.5, 0);
        roofShape.closePath();

        const roofGeom = new THREE.ExtrudeGeometry(roofShape, {
            depth: 8.5,
            bevelEnabled: false,
        });
        const roof = new THREE.Mesh(roofGeom, this.materials.metal);
        roof.rotation.x = Math.PI / 2;
        roof.position.set(0, 6, 4.25);
        roof.castShadow = true;
        warehouse.add(roof);

        // Large door
        const doorGeom = new THREE.BoxGeometry(4, 4.5, 0.2);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 2.25, 4.1);
        warehouse.add(door);

        // Windows
        const windowGeom = new THREE.BoxGeometry(1.5, 1, 0.2);
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x4a6a8a,
            transparent: true,
            opacity: 0.6,
        });
        [
            [-4, 4.5],
            [4, 4.5],
        ].forEach(([wx, wy]) => {
            const window = new THREE.Mesh(windowGeom, windowMat);
            window.position.set(wx, wy, 4.1);
            warehouse.add(window);
        });

        warehouse.position.set(x, 0, z);
        warehouse.rotation.y = Math.PI / 6;
        this.scene.add(warehouse);
        this.objects.push(warehouse);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "building" });
    }

    createCabin(x, z) {
        const cabin = new THREE.Group();

        // Base
        const baseGeom = new THREE.BoxGeometry(5, 3, 4);
        const base = new THREE.Mesh(baseGeom, this.materials.wood);
        base.position.y = 1.5;
        base.castShadow = true;
        base.receiveShadow = true;
        cabin.add(base);

        // Roof
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-2.8, 0);
        roofShape.lineTo(0, 1.8);
        roofShape.lineTo(2.8, 0);
        roofShape.closePath();

        const roofGeom = new THREE.ExtrudeGeometry(roofShape, {
            depth: 4.5,
            bevelEnabled: false,
        });
        const roof = new THREE.Mesh(roofGeom, this.materials.roofTile);
        roof.rotation.x = Math.PI / 2;
        roof.position.set(0, 3, 2.25);
        roof.castShadow = true;
        cabin.add(roof);

        // Door
        const doorGeom = new THREE.BoxGeometry(1, 2, 0.15);
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 1, 2.05);
        cabin.add(door);

        // Window
        const windowGeom = new THREE.BoxGeometry(0.8, 0.8, 0.15);
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x6a8a9a,
            transparent: true,
            opacity: 0.5,
        });
        const window = new THREE.Mesh(windowGeom, windowMat);
        window.position.set(-1.5, 1.8, 2.05);
        cabin.add(window);

        // Porch
        const porchGeom = new THREE.BoxGeometry(5.5, 0.2, 1.5);
        const porch = new THREE.Mesh(porchGeom, this.materials.woodDark);
        porch.position.set(0, 0.1, 2.7);
        porch.receiveShadow = true;
        cabin.add(porch);

        cabin.position.set(x, 0, z);
        this.scene.add(cabin);
        this.objects.push(cabin);
    }

    createRuinedBuilding(x, z) {
        const ruin = new THREE.Group();

        // Broken walls
        const wallConfigs = [
            { size: [8, 4, 0.4], pos: [0, 2, 0], rot: 0 },
            { size: [0.4, 3, 6], pos: [3.8, 1.5, 3], rot: 0 },
            { size: [0.4, 5, 6], pos: [-3.8, 2.5, 3], rot: 0 },
            { size: [5, 2.5, 0.4], pos: [1.5, 1.25, 6], rot: 0 },
        ];

        wallConfigs.forEach(({ size, pos, rot }) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), this.materials.brick);
            wall.position.set(...pos);
            wall.rotation.y = rot;
            wall.castShadow = true;
            wall.receiveShadow = true;
            ruin.add(wall);
        });

        // Rubble
        const rubbleMat = this.materials.rock;
        for (let i = 0; i < 12; i++) {
            const size = 0.3 + Math.random() * 0.6;
            const rubble = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.6, size), rubbleMat);
            rubble.position.set(Math.random() * 6 - 3, size * 0.3, Math.random() * 6);
            rubble.rotation.set(Math.random(), Math.random(), Math.random());
            rubble.castShadow = true;
            ruin.add(rubble);
        }

        ruin.position.set(x, 0, z);
        ruin.rotation.y = Math.PI / 8;
        this.scene.add(ruin);
        this.objects.push(ruin);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "ruins" });
    }

    createShed(x, z) {
        const shed = new THREE.Group();

        // Base
        const baseGeom = new THREE.BoxGeometry(4, 2.5, 3);
        const base = new THREE.Mesh(baseGeom, this.materials.metal);
        base.position.y = 1.25;
        base.castShadow = true;
        shed.add(base);

        // Slanted roof
        const roofGeom = new THREE.BoxGeometry(4.3, 0.1, 3.3);
        const roof = new THREE.Mesh(roofGeom, this.materials.metalRusted);
        roof.position.set(0, 2.6, 0);
        roof.rotation.x = 0.15;
        roof.castShadow = true;
        shed.add(roof);

        // Door
        const doorGeom = new THREE.BoxGeometry(1.2, 2, 0.1);
        const doorMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
        const door = new THREE.Mesh(doorGeom, doorMat);
        door.position.set(0, 1, 1.55);
        shed.add(door);

        shed.position.set(x, 0, z);
        shed.rotation.y = -Math.PI / 4;
        this.scene.add(shed);
        this.objects.push(shed);
    }

    createNaturalCover() {
        // Large rocks for cover
        const rockPositions = [
            { pos: [-8, 12], scale: 2.5 },
            { pos: [10, -8], scale: 2 },
            { pos: [-15, -18], scale: 2.2 },
            { pos: [22, 15], scale: 1.8 },
            { pos: [0, -28], scale: 2.3 },
            { pos: [-28, 5], scale: 2 },
            { pos: [28, -20], scale: 1.9 },
            { pos: [-12, 25], scale: 2.1 },
        ];

        rockPositions.forEach(({ pos, scale }) => {
            this.createRockFormation(pos[0], pos[1], scale);
        });

        // Fallen logs
        this.createFallenLog(-18, -5, Math.PI / 3);
        this.createFallenLog(15, 22, -Math.PI / 4);
        this.createFallenLog(-25, 18, Math.PI / 6);
    }

    createRockFormation(x, z, scale) {
        const formation = new THREE.Group();

        // Main rock
        const mainGeom = new THREE.DodecahedronGeometry(scale, 1);
        // Deform vertices for natural look
        const vertices = mainGeom.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] *= 0.8 + Math.random() * 0.4;
            vertices[i + 1] *= 0.6 + Math.random() * 0.4;
            vertices[i + 2] *= 0.8 + Math.random() * 0.4;
        }
        mainGeom.computeVertexNormals();

        const mainRock = new THREE.Mesh(mainGeom, this.materials.rock);
        mainRock.position.y = scale * 0.4;
        mainRock.castShadow = true;
        mainRock.receiveShadow = true;
        formation.add(mainRock);

        // Smaller rocks around
        for (let i = 0; i < 3; i++) {
            const smallScale = scale * (0.2 + Math.random() * 0.3);
            const smallGeom = new THREE.DodecahedronGeometry(smallScale, 0);
            const smallRock = new THREE.Mesh(smallGeom, this.materials.rock);
            smallRock.position.set(
                (Math.random() - 0.5) * scale * 2,
                smallScale * 0.3,
                (Math.random() - 0.5) * scale * 2
            );
            smallRock.rotation.set(Math.random(), Math.random(), Math.random());
            smallRock.castShadow = true;
            formation.add(smallRock);
        }

        formation.position.set(x, 0, z);
        this.scene.add(formation);
        this.objects.push(formation);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "natural" });
    }

    createFallenLog(x, z, rotation) {
        const log = new THREE.Group();

        // Main trunk
        const trunkGeom = new THREE.CylinderGeometry(0.4, 0.5, 5, 12);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.woodDark);
        trunk.rotation.z = Math.PI / 2;
        trunk.position.y = 0.4;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        log.add(trunk);

        // Broken branches
        const branchGeom = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 6);
        for (let i = 0; i < 4; i++) {
            const branch = new THREE.Mesh(branchGeom, this.materials.woodDark);
            branch.position.set(Math.random() * 3 - 1.5, 0.4 + Math.random() * 0.3, Math.random() * 0.3);
            branch.rotation.set(Math.random(), Math.random(), Math.PI / 3);
            branch.castShadow = true;
            log.add(branch);
        }

        log.position.set(x, 0, z);
        log.rotation.y = rotation;
        this.scene.add(log);
        this.objects.push(log);
        this.coverSpots.push({ position: new THREE.Vector3(x, 0, z), type: "low" });
    }

    createVegetation() {
        // Trees in strategic positions (not blocking sightlines)
        const treePositions = [
            [-35, -10],
            [-38, 5],
            [-32, 15],
            [-40, -25],
            [35, -12],
            [38, 8],
            [32, 20],
            [40, -18],
            [-42, 0],
            [42, 0],
            [-30, -35],
            [30, 35],
            [-45, 25],
            [45, -25],
            [-35, 40],
            [35, -40],
        ];

        treePositions.forEach(([tx, tz]) => {
            this.createTree(tx, tz);
        });

        // Bushes for concealment (using instanced mesh for performance)
        this.createBushes();

        // Grass tufts
        this.createGrassTufts();
    }

    createTree(x, z) {
        const tree = new THREE.Group();
        const heightVariation = 0.8 + Math.random() * 0.4;

        // Trunk
        const trunkHeight = 3 * heightVariation;
        const trunkGeom = new THREE.CylinderGeometry(0.25 * heightVariation, 0.4 * heightVariation, trunkHeight, 8);
        const trunk = new THREE.Mesh(trunkGeom, this.materials.woodDark);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        tree.add(trunk);

        // Foliage - multiple layers
        const foliageMat = Math.random() > 0.5 ? this.materials.foliage : this.materials.foliageDark;

        const foliageConfigs = [
            { radius: 2.2, height: 3.5, y: 4 },
            { radius: 1.6, height: 2.8, y: 5.8 },
            { radius: 1, height: 2, y: 7.2 },
        ];

        foliageConfigs.forEach(({ radius, height, y }) => {
            const foliage = new THREE.Mesh(
                new THREE.ConeGeometry(radius * heightVariation, height * heightVariation, 8),
                foliageMat
            );
            foliage.position.y = y * heightVariation;
            foliage.castShadow = true;
            tree.add(foliage);
        });

        tree.position.set(x, 0, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(tree);
    }

    createBushes() {
        const bushPositions = [
            // Around cover spots
            [7, 6],
            [-7, -6],
            [6, -7],
            [-6, 7],
            // Along paths
            [3, 10],
            [-3, -10],
            [3, -12],
            [-3, 12],
            // Near buildings
            [-18, 8],
            [18, -6],
            [-10, -23],
            [10, 26],
            // Scattered
            [25, 10],
            [-25, -10],
            [15, 30],
            [-15, -30],
        ];

        const bushGeom = new THREE.SphereGeometry(1, 8, 6);
        // Flatten and randomize
        const vertices = bushGeom.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] *= 0.8 + Math.random() * 0.4;
            vertices[i + 1] *= 0.5 + Math.random() * 0.3;
            vertices[i + 2] *= 0.8 + Math.random() * 0.4;
        }
        bushGeom.computeVertexNormals();

        bushPositions.forEach(([bx, bz]) => {
            const scale = 0.8 + Math.random() * 0.6;
            const bush = new THREE.Mesh(bushGeom, this.materials.foliageDark);
            bush.position.set(bx, scale * 0.4, bz);
            bush.scale.setScalar(scale);
            bush.castShadow = true;
            this.scene.add(bush);
        });
    }

    createGrassTufts() {
        // Use instanced mesh for performance
        const tuftGeom = new THREE.ConeGeometry(0.15, 0.4, 4);
        const tuftMat = new THREE.MeshStandardMaterial({
            color: 0x5a8a4a,
            roughness: 1,
        });

        const instanceCount = 200;
        const instancedTufts = new THREE.InstancedMesh(tuftGeom, tuftMat, instanceCount);

        const dummy = new THREE.Object3D();
        for (let i = 0; i < instanceCount; i++) {
            // Random position avoiding center play area
            let x, z;
            do {
                x = Math.random() * 100 - 50;
                z = Math.random() * 100 - 50;
            } while (Math.abs(x) < 15 && Math.abs(z) < 15);

            dummy.position.set(x, 0.2, z);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.setScalar(0.5 + Math.random() * 1);
            dummy.updateMatrix();
            instancedTufts.setMatrixAt(i, dummy.matrix);
        }

        instancedTufts.instanceMatrix.needsUpdate = true;
        this.scene.add(instancedTufts);
    }

    createWaterFeature() {
        // Small pond
        const pondGeom = new THREE.CircleGeometry(6, 24);
        const pond = new THREE.Mesh(pondGeom, this.materials.water);
        pond.rotation.x = -Math.PI / 2;
        pond.position.set(-30, 0.1, 25);
        this.scene.add(pond);

        // Pond edge rocks
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 5.5 + Math.random() * 1;
            const rockSize = 0.3 + Math.random() * 0.5;
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rockSize, 0), this.materials.rock);
            rock.position.set(-30 + Math.cos(angle) * radius, rockSize * 0.3, 25 + Math.sin(angle) * radius);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            this.scene.add(rock);
        }

        // Small stream
        const streamPath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-30, 0.3, 25),
            new THREE.Vector3(-25, 0.3, 30),
            new THREE.Vector3(-18, 0.3, 32),
            new THREE.Vector3(-10, 0.3, 35),
        ]);

        const streamGeom = new THREE.TubeGeometry(streamPath, 20, 1, 8, false);
        const stream = new THREE.Mesh(streamGeom, this.materials.water);
        stream.rotation.x = Math.PI;
        stream.position.y = 0.3;
        this.scene.add(stream);
    }

    createLighting() {
        // Ambient light - slightly blue for outdoor feel
        const ambient = new THREE.AmbientLight(0x6080a0, 0.4);
        this.scene.add(ambient);

        // Main directional sun light
        const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
        sun.position.set(30, 50, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 150;
        sun.shadow.camera.left = -60;
        sun.shadow.camera.right = 60;
        sun.shadow.camera.top = 60;
        sun.shadow.camera.bottom = -60;
        sun.shadow.bias = -0.0005;
        this.scene.add(sun);

        // Fill light from opposite side
        const fill = new THREE.DirectionalLight(0x8090a0, 0.3);
        fill.position.set(-20, 20, -30);
        this.scene.add(fill);

        // Hemisphere light for natural sky/ground color
        const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a7c3f, 0.5);
        this.scene.add(hemi);
    }

    createSky() {
        // Gradient sky dome
        const skyGeom = new THREE.SphereGeometry(90, 32, 32);

        // Create gradient texture
        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, "#1e3a5f"); // Dark blue at top
        gradient.addColorStop(0.3, "#4a7fa8"); // Medium blue
        gradient.addColorStop(0.6, "#87ceeb"); // Light blue
        gradient.addColorStop(1, "#c5dbe8"); // Pale blue at horizon
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 256);

        const skyTexture = new THREE.CanvasTexture(canvas);
        const skyMat = new THREE.MeshBasicMaterial({
            map: skyTexture,
            side: THREE.BackSide,
        });
        const sky = new THREE.Mesh(skyGeom, skyMat);
        this.scene.add(sky);

        // Sun
        const sunGeom = new THREE.SphereGeometry(4, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xfff5d0,
        });
        const sunMesh = new THREE.Mesh(sunGeom, sunMat);
        sunMesh.position.set(40, 55, 25);
        this.scene.add(sunMesh);

        // Sun glow
        const glowGeom = new THREE.SphereGeometry(8, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xfff8e0,
            transparent: true,
            opacity: 0.3,
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.copy(sunMesh.position);
        this.scene.add(glow);

        // Clouds using instanced mesh for performance
        this.createClouds();
    }

    createClouds() {
        const cloudMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
        });

        for (let i = 0; i < 10; i++) {
            const cloud = new THREE.Group();
            const puffCount = 4 + Math.floor(Math.random() * 4);

            for (let j = 0; j < puffCount; j++) {
                const puffSize = 3 + Math.random() * 4;
                const puff = new THREE.Mesh(new THREE.SphereGeometry(puffSize, 8, 6), cloudMat);
                puff.position.set(j * 4 - puffCount * 2, Math.random() * 2 - 1, Math.random() * 3 - 1.5);
                puff.scale.y = 0.6;
                cloud.add(puff);
            }

            cloud.position.set(Math.random() * 140 - 70, 35 + Math.random() * 15, Math.random() * 140 - 70);
            this.scene.add(cloud);
        }
    }

    // Get objects for collision detection
    getColliders() {
        return this.objects;
    }

    // Get tactical cover spots
    getCoverSpots() {
        return this.coverSpots;
    }

    // Update method for any animated elements
    update(deltaTime) {
        // Could add wind animation for trees, water ripples, etc.
    }
}

export default World;
