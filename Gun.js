import * as THREE from "three";
import Player from "./Player";

class Gun {
  constructor(scene) {
    this.scene = scene;
    this.model = new THREE.Group();
    this.player = null;
    this.offpos = new THREE.Vector3(0.4, -0.25, -0.4);
    this.offrot = new THREE.Vector3(0.01, -0.1, 0);
    this.swaypos = new THREE.Vector3(0, 0, 0);
  }

  create() {
    const metalDark = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const metalLight = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      metalness: 0.7,
      roughness: 0.4,
    });
    const wood = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.8,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Main body / Receiver
    const receiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.15, 0.5),
      metalDark
    );
    receiver.position.set(0, 0, 0);
    this.model.add(receiver);

    // Barrel
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.035, 0.6, 8),
      metalLight
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.5);
    this.model.add(barrel);

    // Barrel tip / Muzzle
    const muzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.03, 0.08, 8),
      accent
    );
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.02, -0.82);
    this.model.add(muzzle);

    // Barrel hole (black inside)
    const barrelHole = new THREE.Mesh(
      new THREE.CircleGeometry(0.025, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    barrelHole.position.set(0, 0.02, -0.861);
    this.model.add(barrelHole);

    // Top rail
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.03, 0.45),
      metalLight
    );
    rail.position.set(0, 0.09, -0.1);
    this.model.add(rail);

    // Front sight
    const frontSight = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.05, 0.015),
      accent
    );
    frontSight.position.set(0, 0.13, -0.3);
    this.model.add(frontSight);

    // Rear sight
    const rearSightLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.04, 0.02),
      accent
    );
    rearSightLeft.position.set(-0.025, 0.12, 0.1);
    this.model.add(rearSightLeft);

    const rearSightRight = rearSightLeft.clone();
    rearSightRight.position.x = 0.025;
    this.model.add(rearSightRight);

    // Handle / Grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.12), wood);
    grip.position.set(0, -0.12, 0.15);
    grip.rotation.x = -0.2;
    this.model.add(grip);

    // Grip texture lines
    for (let i = 0; i < 4; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.101, 0.008, 0.1),
        accent
      );
      line.position.set(0, -0.08 - i * 0.035, 0.15);
      line.rotation.x = -0.2;
      this.model.add(line);
    }

    // Trigger guard
    const guardShape = new THREE.Shape();
    guardShape.moveTo(0, 0);
    guardShape.lineTo(0.08, 0);
    guardShape.lineTo(0.08, -0.06);
    guardShape.quadraticCurveTo(0.04, -0.1, 0, -0.06);
    guardShape.lineTo(0, 0);

    const guardGeom = new THREE.ExtrudeGeometry(guardShape, {
      depth: 0.015,
      bevelEnabled: false,
    });
    const guard = new THREE.Mesh(guardGeom, metalDark);
    guard.rotation.y = Math.PI / 2;
    guard.position.set(0.0075, -0.02, 0.08);
    this.model.add(guard);

    // Trigger
    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.05, 0.02),
      metalLight
    );
    trigger.position.set(0, -0.045, 0.04);
    trigger.rotation.x = 0.3;
    this.model.add(trigger);

    // Magazine
    const magazine = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.1),
      metalDark
    );
    magazine.position.set(0, -0.1, -0.05);
    this.model.add(magazine);

    // Magazine bottom
    const magBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.02, 0.105),
      accent
    );
    magBottom.position.set(0, -0.18, -0.05);
    this.model.add(magBottom);

    // Slide / Top section
    const slide = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.06, 0.55),
      metalLight
    );
    slide.position.set(0, 0.05, -0.15);
    this.model.add(slide);

    // Ejection port
    const ejectionPort = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.03, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    ejectionPort.position.set(0, 0.05, 0.02);
    this.model.add(ejectionPort);

    // Hammer
    const hammer = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.05, 0.03),
      metalDark
    );
    hammer.position.set(0, 0.06, 0.24);
    hammer.rotation.x = -0.4;
    this.model.add(hammer);

    // Safety switch
    const safety = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.025, 6),
      accent
    );
    safety.rotation.z = Math.PI / 2;
    safety.position.set(0.07, 0.02, 0.1);
    this.model.add(safety);

    // Add shadows to all meshes
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return this.model;
  }

  sway(delta) {
    let target;
    if (this.player.velocity.length() >= 0.01) {
      target = this.player.velocity.clone();
      target.applyQuaternion(this.player.camera.quaternion.clone().invert());
      target.set(
        target.x * Math.abs(target.x),
        target.y * Math.abs(target.y),
        target.z * Math.abs(target.z)
      );
      target.normalize().multiplyScalar(-0.02);
    } else {
      target = new THREE.Vector3();
    }
    this.swaypos.lerp(target, delta * 10);

    const pos = this.offpos.clone().add(this.swaypos);
    const rot = this.offrot.clone();

    if (this.swaypos.length() > 0.001) {
      const perpAxis = new THREE.Vector3();
      perpAxis.crossVectors(
        new THREE.Vector3(0, 0, -1),
        this.swaypos.clone().normalize()
      );
      const rotAmount = this.swaypos.length(); // Adjust multiplier as needed

      rot.x += perpAxis.x * rotAmount * 3;
      rot.y += perpAxis.y * rotAmount * 3;
      rot.z += perpAxis.z * rotAmount * 3;
    }

    this.model.rotation.x = rot.x;
    this.model.rotation.y = rot.y;
    this.model.rotation.z = rot.z;
    this.model.position.copy(pos);
  }

  update(delta) {
    if (this.player === null) {
      return;
    }

    this.sway(delta);

    // console.log(this.model.position);
  }

  // Attach to camera for FPS view
  equip(player) {
    this.player = player;
    this.scene.add(this.model);
    this.player.camera.add(this.model);

    this.model.position.copy(this.offpos);
    this.model.rotation.set(this.offrot.x, this.offrot.y, this.offrot.z);

    console.log(this.model.position);
    this.model.visible = true;
    this.isEquipped = true;
  }

  unequip() {
    this.model.visible = false;
    this.scene.remove(this.model);
    this.isEquipped = false;
    this.group = null;
    this.player = null;
  }

  // Simple recoil animation
  recoil() {
    const originalZ = this.model.position.z;
    const originalRotX = this.model.rotation.x;

    this.model.position.z += 0.05;
    this.model.rotation.x -= 0.1;

    setTimeout(() => {
      this.model.position.z = originalZ;
      this.model.rotation.x = originalRotX;
    }, 100);
  }

  setPosition(x, y, z) {
    this.model.position.set(x, y, z);
  }

  setRotation(x, y, z) {
    this.model.rotation.set(x, y, z);
  }

  // Get the model group
  getModel() {
    return this.model;
  }
}

export default Gun;
