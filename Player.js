import * as THREE from "three";
import Gun from "./Gun";
class Player {
  constructor(camera, scene, world) {
    this.world = world;
    this.camera = camera;
    this.scene = scene;
    this.height = 2;
    this.camera.position.y = 2;
    this.keys = {
      X: 0,
      Z: 0,
      jump: false,
      crouch: false,
      sprint: false,
    };

    this.speed = 1;
    this.sprintMultiplier = 1.5;
    this.momentumLoss = 0.85;
    this.gravity = 0.6;

    this.jumpForce = 0.3;
    this.jumpDuration = 0;
    this.jumpTimer = 0.2;

    this.jetForce = 0.15;
    this.jetFuel = 1;

    this.slide = {
      inProgress: false,
      duration: 0.5,
      progress: 0,
      direction: new THREE.Vector3(),
      speed: 0.2,
    };
    this.jump = {
      progress: 0,
      duration: 100,
      power: 10,
    };
    this.velocity = new THREE.Vector3();
    this.moveVector = new THREE.Vector3();

    this.gun = new Gun(scene);
    this.gun.create();
    this.gun.equip(this);
    this.gunOffset = new THREE.Vector3(1, -0.5, -1);
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.onKeyUp(e));
    // document.addEventListener("mousedown", )
  }

  onKeyDown(e) {
    if (e.repeat) return;
    switch (e.code) {
      case "KeyW":
        this.keys.X += 1;
        break;
      case "KeyS":
        this.keys.X -= 1;
        break;
      case "KeyD":
        this.keys.Z += 1;
        break;
      case "KeyA":
        this.keys.Z -= 1;
        break;
      case "Space":
        this.keys.jump = true;
        break;
      case "ControlLeft":
        this.keys.crouch = true;
        break;
      case "ShiftLeft":
        this.keys.sprint = true;
        break;
      default:
        break;
    }
  }

  onKeyUp(e) {
    if (e.repeat) return;
    switch (e.code) {
      case "KeyW":
        this.keys.X -= 1;
        break;
      case "KeyS":
        this.keys.X += 1;
        break;
      case "KeyD":
        this.keys.Z -= 1;
        break;
      case "KeyA":
        this.keys.Z += 1;
        break;
      case "Space":
        this.keys.jump = false;
        break;
      case "ControlLeft":
        this.keys.crouch = false;
        break;
      case "ShiftLeft":
        this.keys.sprint = false;
        break;
      default:
        break;
    }
  }

  create() {
    this.camera.position.y += this.height;
    this.scene.add(this.camera);
  }

  resetSlide() {
    this.slide.progress = 0;
    this.slide.inProgress = false;
    this.slideDir = new THREE.Vector3();
    this.camera.position.y = 2;
  }

  startSlide(cameraDir, perpendicular) {
    this.slide.inProgress = true;
    this.slide.direction = new THREE.Vector3();
    this.slide.direction.add(cameraDir.clone().multiplyScalar(this.keys.X));
    this.slide.direction.add(perpendicular.clone().multiplyScalar(this.keys.Z));
  }

  handleSlide(delta) {
    this.slide.progress += delta;

    const t = Math.min(this.slide.progress / this.slide.duration, 1);

    let amt = 0;
    if (t <= 0.2) {
      const phase = t / 0.2;
      amt = phase;
      this.camera.position.y = 2 - phase;
    } else if (t >= 0.8) {
      const phase = (t - 0.8) / 0.2;
      amt = 1 - phase;
      this.camera.position.y = 1 + phase;
    } else {
      this.camera.position.y = 1;
      amt = 1;
    }

    amt *= this.slide.speed;
    amt += 1;

    this.moveVector.add(this.slide.direction);
    this.moveVector.multiplyScalar(delta * this.speed * amt);

    if (this.slide.progress > this.slide.duration) {
      this.resetSlide();
    }
  }

  getDirectionVectors(cameraDir, perpendicular) {
    this.camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;

    perpendicular.crossVectors(cameraDir, new THREE.Vector3(0, 1, 0));

    this.moveVector = new THREE.Vector3();
    this.moveVector.add(cameraDir.clone().multiplyScalar(this.keys.X));
    this.moveVector.add(perpendicular.clone().multiplyScalar(this.keys.Z));
    return this.moveVector;
  }

  isGrounded() {
    return this.camera.position.y <= 2;
  }

  handleFalling(delta) {
    if (this.jumpDuration < this.jumpTimer) {
      this.jumpDuration += delta;
    }
    if (!this.isGrounded()) {
      this.velocity.y -= delta * this.gravity;
      if (this.camera.y - this.velocity.y <= 2) {
        this.velocity.y = 2 - this.camera.position.y;
      }
      if (this.keys.jump && this.jumpDuration >= this.jumpTimer) {
        this.handleJetpack(delta);
      }
    } else {
      this.velocity.y = 2 - this.camera.position.y;
    }
  }

  handleJetpack(delta) {
    if (this.jetFuel < 0) {
      return;
    }
    this.velocity.y += (this.jetForce + this.gravity) * delta;
    this.velocity.y = Math.min(this.velocity.y, 0.1);
    this.jetFuel -= delta;
  }

  handleCollision(delta) {}

  update(delta) {
    let move = delta * this.speed;
    if (this.keys.sprint) {
      move *= this.sprintMultiplier;
    }

    this.handleFalling(delta);

    const cameraDir = new THREE.Vector3();
    const perpendicular = new THREE.Vector3();
    this.getDirectionVectors(cameraDir, perpendicular);

    if (this.keys.sprint && this.keys.crouch && !this.slide.inProgress) {
      this.startSlide(cameraDir, perpendicular);
    }

    if (this.slide.inProgress) {
      this.handleSlide(delta);
    } else if (this.moveVector.length() > 0) {
      this.moveVector.normalize();
      this.moveVector.multiplyScalar(move);
    }

    if (this.keys.jump) {
      if (this.isGrounded()) {
        this.velocity.y = this.jumpForce * (0.5 + this.velocity.length() / 2);
        this.jumpDuration = 0;
      }
    }
    if (this.isGrounded()) {
      this.jetFuel += delta;
    }
    this.velocity.clampLength(0, 3);
    this.velocity.sub(
      new THREE.Vector3(this.velocity.x, 0, this.velocity.z).multiplyScalar(
        1 - this.momentumLoss
      )
    );
    this.velocity.add(this.moveVector);
    this.camera.position.add(this.velocity);
    this.gun.update(delta);
  }
}

export default Player;
