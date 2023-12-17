import * as THREE from 'three'
import Touches from '../utils/touches.js';
import { ref } from 'vue'

export const useTopDownCamera = (options = {}) => {
    const near = options.near || 0.1;
    const far = options.far || 1000;
    const fov = options.fov || 45;
    const aspect = options.aspect || window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    const moveSpeed = ref(options.moveSpeed || 0.1);
    const zoomSpeed = ref(options.zoomSpeed || 3);
    const minZoom = ref(options.minZoom || 0.1);
    const maxZoom = ref(options.maxZoom || 50);

    const currentPosition = options.currentPosition || new THREE.Vector3(0, 5, 0);
    const currentZoom = options.zoomVector || new THREE.Vector3(0, options.currentZoom || 50, 0);

    const zoom = (dir) => {
        currentZoom.y += dir * zoomSpeed.value;
        currentZoom.y = Math.max(currentZoom.y, minZoom.value);
        currentZoom.y = Math.min(currentZoom.y, maxZoom.value);      
    }

    const move = (dx, dy, dz) => {
        currentPosition.x += dx * moveSpeed.value;
        currentPosition.y += dy * moveSpeed.value;
        currentPosition.z += dz * moveSpeed.value;
    }

    const adjustPosition = () => {
        currentPosition.y = currentZoom.y;
        camera.position.lerp(currentPosition, 0.1);
    }

    const adjustZoom = () => {
        currentZoom.x = currentPosition.x;
        currentZoom.z = currentPosition.z;
        camera.position.lerp(currentZoom, 0.1);
    }

    const update = () => {
        adjustPosition();
        adjustZoom();
    }

    const onScroll = (e) => {
        const dir = e.deltaY > 0 ? 1 : -1;
        zoom(dir);
    }

    const onTouch = (e) => {
        e.preventDefault();
        // Check if pinch
        if (Touches.isPinch(e.touches)) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const dir = dist > 0 ? 1 : -1;
            zoom(dir);
        }
        // Check if drag
        else if (Touches.isDrag(e.touches)) {
            const dx = e.touches[0].clientX - e.touches[0].clientX;
            const dy = e.touches[0].clientY - e.touches[0].clientY;
            move(dx, 0, dy);
        }
    }

    const onPointerMove = (e) => {
        e.preventDefault();
        // Check if the pointer is pressed
        if (e.buttons === 1) {
            const dx = e.movementX;
            const dy = e.movementY;
            move(-dx, 0, -dy);
        }
    }

    const enable = () => {
        window.addEventListener('wheel', onScroll);
        window.addEventListener('touchmove', onTouch);
        window.addEventListener('pointermove', onPointerMove);
    }

    const disable = () => {
        window.removeEventListener('wheel', onScroll);
        window.removeEventListener('touchmove', onTouch);
        window.removeEventListener('pointermove', onPointerMove);
    }

    const setMoveSpeed = (speed) => {
        moveSpeed.value = speed;
    }

    const setZoomSpeed = (speed) => {
        zoomSpeed.value = speed;
    }

    const setMinZoom = (min) => {
        minZoom.value = min;
    }

    const setMaxZoom = (max) => {
        maxZoom.value = max;
    }

    const setPosition = (x, z) => {
        currentPosition.x = x;
        currentPosition.y = currentZoom.y;
        currentPosition.z = z;
    }

    const setZoom = (zoom) => {
        currentZoom.y = zoom;
    }

    const focus = (object3D, xOffset=0, zOffset=15, zoomValue=25) => {
        const objectPosition = object3D.position;
        setPosition(objectPosition.x + xOffset, objectPosition.z + zOffset);
        setZoom(zoomValue);
    }

    return {
        zoom,
        move,
        update,
        camera,
        enable,
        disable,
        setMoveSpeed,
        setZoomSpeed,
        setMinZoom,
        setMaxZoom,
        setPosition,
        setZoom,
        focus
    }
}
