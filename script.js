import * as THREE from "three";
import World from "./World";
import Player from "./Player";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const scene = new THREE.Scene();
const canvas = document.querySelector("canvas.webgl");
canvas.addEventListener("click", () => {
    controls.lock();
});

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const controls = new PointerLockControls(camera, renderer.domElement);

const player = new Player(camera, scene);
player.create();

const world = new World(scene);
world.create();

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    player.update(delta);
    renderer.render(scene, camera);
}

animate();
