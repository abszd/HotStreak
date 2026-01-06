import * as THREE from "three";
import Gun from "./Gun";
import World from "./World";

class Player {
    constructor(camera, scene, world) {
        this.world = world;
        this.camera = camera;
        this.scene = scene;
        this.height = 2;
        this.camera.position.y = 2;

        this.collisionShape = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 1);
        this.keys = {
            X: 0,
            Z: 0,
            jump: false,
            crouch: false,
            sprint: false,
        };

        this.speed = 1;
        this.sprintMultiplier = 1.7;
        this.momentumLoss = 0.85;
        this.gravity = 0.3;
        this.isFalling = false;

        this.jet = {
            on: false,
            force: 0.1,
            fuel: 1.25,
            tank: 1.25,
            restoreRate: 0.5,
        };
        this.slide = {
            inProgress: false,
            duration: 0.5,
            progress: 0,
            direction: new THREE.Vector3(),
            speed: 0.2,
            reset: 2,
            resetProgress: 2,
        };

        this.jump = {
            progress: 0.35,
            duration: 0.35,
            power: 0.2,
        };

        this.velocity = new THREE.Vector3();
        this.moveVector = new THREE.Vector3();
        this.curRoll = 0;
        this.curPitch = 0;
        this.curVert = 0;

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
        document.addEventListener(
            "blur",
            () =>
                (this.keys = {
                    X: 0,
                    Z: 0,
                    jump: false,
                    crouch: false,
                    sprint: false,
                })
        );
    }

    onKeyDown(e) {
        e.preventDefault();
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
        e.preventDefault();
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
        this.slide.resetProgress = 0;
    }

    startSlide(cameraDir, perpendicular) {
        this.slide.inProgress = true;
        this.slide.direction = new THREE.Vector3();
        this.slide.direction.add(cameraDir.clone().multiplyScalar(this.keys.X));
        this.slide.direction.add(perpendicular.clone().multiplyScalar(this.keys.Z));
    }

    handleSlide(delta) {
        this.slide.progress += delta;
        const height = 2;

        const t = Math.min(this.slide.progress / this.slide.duration, 1);

        let amt = 0;
        const phase = height * (-4 * (t - 0.5) * (t - 0.5) + 1);
        console.log(this.height + phase);
        amt += height - phase;
        this.collisionShape.center.y = this.height - 1 + phase;
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
        if (this.jump.progress <= this.jump.duration) {
            this.jump.progress += delta;
        }
        if (!this.isGrounded()) {
            this.isFalling = true;
            this.velocity.y -= delta * this.gravity;
            if (this.camera.y - this.velocity.y <= 2) {
                this.velocity.y = 2 - this.camera.position.y;
            }
            if (this.keys.jump && this.jump.progress > this.jump.duration) {
                this.handleJetpack(delta);
            }
        } else {
            this.isFalling = false;
            this.velocity.y = 2 - this.camera.position.y;
        }
    }

    handleJetpack(delta) {
        this.jet.tank -= delta;
        if (this.jet.tank <= 0) {
            this.jet.on = false;
            return;
        }
        this.jet.on = true;
        //console.log(this.jet);

        this.velocity.y += (this.jet.force + this.gravity) * delta;
        this.velocity.y = Math.min(this.velocity.y, 0.1);
    }

    handleCollision(depth = 0) {
        if (depth > 5) return;

        const velocityLength = this.velocity.length();
        if (velocityLength < 0.0001) return;

        const direction = this.velocity.clone().normalize();
        const radius = this.collisionShape.radius;

        // Start ray from behind the sphere
        const rayOrigin = this.collisionShape.center.clone().sub(direction.clone().multiplyScalar(radius));

        const raycaster = new THREE.Raycaster(
            rayOrigin,
            direction,
            0,
            velocityLength + radius * 2 // Full sphere diameter + velocity
        );

        const intersects = raycaster.intersectObjects(this.world.objects);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const distanceToSurface = hit.distance - radius * 2; // Account for starting behind

            if (distanceToSurface < velocityLength) {
                const normal = hit.face.normal.clone();
                normal.transformDirection(hit.object.matrixWorld);

                const safeDistance = Math.max(distanceToSurface - 0.01, 0);
                this.collisionShape.center.add(direction.clone().multiplyScalar(safeDistance));

                const dot = this.velocity.dot(normal);
                if (dot < 0) {
                    this.velocity.sub(normal.clone().multiplyScalar(dot));
                }

                if (this.velocity.length() > 0.001) {
                    this.handleCollision(depth + 1);
                }
                return;
            }
        }

        this.collisionShape.center.add(this.velocity);
    }

    swayCamera(delta) {
        const maxTilt = 0.4;
        const target = this.velocity.clone();
        target.applyQuaternion(this.camera.quaternion.clone().invert());
        const sideways = target.x;
        const frontback = target.z;
        const vertical = target.y;

        const rollDif = (-sideways * maxTilt - this.curRoll) * delta * 8;
        const pitchDif = (frontback * maxTilt * 2 - this.curPitch) * delta * 8;
        const vertDif = (vertical * maxTilt * (this.slide.inProgress ? -5 : 2) - this.curVert) * delta * 8;

        const rollQuat = new THREE.Quaternion();
        rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rollDif);
        const pitchQuat = new THREE.Quaternion();
        pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitchDif);
        const vertQuat = new THREE.Quaternion();
        vertQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), vertDif);

        this.camera.quaternion.multiply(rollQuat).multiply(pitchQuat).multiply(vertQuat);
        this.curRoll += rollDif;
        this.curPitch += pitchDif;
        this.curVert += vertDif;
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
        if (this.slide.resetProgress >= this.slide.reset) {
            if (this.keys.sprint && this.keys.crouch && this.isGrounded() && !this.slide.inProgress) {
                this.startSlide(cameraDir, perpendicular);
            }
        }
        {
            this.slide.resetProgress += delta;
        }
        if (this.slide.inProgress) {
            this.handleSlide(delta);
        } else if (this.moveVector.length() > 0) {
            this.moveVector.normalize();
            this.moveVector.multiplyScalar(move);
        }

        //console.log(this.keys.jump, !this.slide.inProgress, this.jump.progress > this.jump.duration, this.jump);
        if (this.keys.jump && !this.slide.inProgress && this.jump.progress > this.jump.duration) {
            //console.log(this.velocity);
            if (this.isGrounded()) {
                const horizontalVelocity = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
                this.velocity.y = this.jump.power * (0.5 + Math.min(horizontalVelocity.length() / 2, 0.5));
                this.jump.progress = 0;
            }
        }
        if (this.isGrounded()) {
            this.jet.tank +=
                this.jet.tank < this.jet.fuel ? delta * this.jet.restoreRate : this.jet.fuel - this.jet.tank;
        }
        this.velocity.clampLength(0, 3);
        this.velocity.sub(
            new THREE.Vector3(this.velocity.x, 0, this.velocity.z).multiplyScalar(
                1 - (this.isFalling ? this.momentumLoss + 0.075 : this.momentumLoss)
            )
        );
        if (this.isFalling) {
            this.moveVector.multiplyScalar(0.5);
        }
        this.velocity.add(this.moveVector);
        //console.log(this.collisionShape.center);
        this.handleCollision();
        this.camera.position.set(
            this.collisionShape.center.x,
            this.collisionShape.center.y + 1,
            this.collisionShape.center.z
        );

        //console.log(this.collisionShape.center);
        this.gun.update(delta);
        this.swayCamera(delta);
    }
}

export default Player;
