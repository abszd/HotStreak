import * as THREE from "three";
import Gun from "./Gun";
class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.height = 2;
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
        this.gravity = 1;
        this.jumpForce = 0.5;

        this.slide = {
            inProgress: false,
            duration: 100,
            progress: 0,
            direction: new THREE.Vector3(),
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
        this.gun.equip(this.camera);
        this.gunOffset = new THREE.Vector3(1, -0.5, -1);
        this.addEventListeners();
    }

    addEventListeners() {
        document.addEventListener("keydown", (e) => this.onKeyDown(e));
        document.addEventListener("keyup", (e) => this.onKeyUp(e));
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
        let amt = 1;
        if (this.slide.progress <= 20) {
            amt += this.slide.progress / 100;
            this.camera.position.y = 2 - this.slide.progress / 20;
        } else if (this.slide.progress >= 80) {
            amt += (100 - this.slide.progress) / 100;
            this.camera.position.y = 2 - (100 - this.slide.progress) / 20;
        } else {
            this.camera.position.y = 1;
            amt += 0.2;
        }
        this.moveVector.add(this.slide.direction);
        this.moveVector.multiplyScalar(delta * this.speed);
        this.moveVector.multiplyScalar(amt);
        this.slide.progress += delta * 200;
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
        if (!this.isGrounded()) {
            this.velocity.y -= delta * this.gravity;
            if (this.camera.y - this.velocity.y <= 2) {
                this.velocity.y = 2 - this.camera.position.y;
            }
        } else {
            this.velocity.y = 2 - this.camera.position.y;
        }
    }
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
        if (this.keys.jump && this.isGrounded()) {
            this.velocity.y = this.jumpForce * (0.5 + this.velocity.length() / 2);
        }
        this.velocity.clampLength(0, 3);
        this.velocity.sub(new THREE.Vector3(this.velocity.x, 0, this.velocity.z).multiplyScalar(1 - this.momentumLoss));
        this.velocity.add(this.moveVector);
        this.camera.position.add(this.velocity);

        const gunPos = this.camera.position.clone().add(this.gunOffset);
        this.gun.setPosition(gunPos.x, gunPos.y, gunPos.z);
        // const euler = new THREE.Euler().setFromVector3(cameraDir, "YXZ");
        // this.gun.setRotation(euler, euler.y, euler.z);
    }
}

export default Player;
