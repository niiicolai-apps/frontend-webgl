<template>
    <Canvas3d 
        ref="canvas" 
        :options="options" 
        class="w-full h-full block" 
    />
</template>

<script setup>
import Canvas3d from './Canvas3d.vue';

import * as THREE from 'three'
import { ref, onMounted, onUnmounted } from 'vue';
import { useTopDownCamera } from '../../composables/topDownCamera.js';

const canvas = ref(null);
const cameraManager = useTopDownCamera({
    minZoom: 5,
    maxZoom: 120,
    currentZoom: 80,
    currentPosition: new THREE.Vector3(0, 0, 35),
});
const options = {
    camera: {
        custom: cameraManager.camera,
        rotation: { 
            x: -60 * Math.PI / 180, 
        },
    },
};

onMounted(() => {
    const { scene, lifeCycle } = canvas.value.adapter;

    const redColor = new THREE.Color(0xff0000);
    const greenColor = new THREE.Color(0x00ff00);

    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhysicalMaterial({ color: redColor });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    scene.add(groundMesh);

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhysicalMaterial({ color: greenColor });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cubeMesh);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 10, 0);
    scene.add(light);

    let cubeMeshDirectionRight = true;
    lifeCycle.onAnimate.push(() => {
        cubeMesh.rotation.x += 0.01;
        cubeMesh.rotation.y += 0.01;
        
        if (cubeMesh.position.x > 50) {
            cubeMeshDirectionRight = false;
        } else if (cubeMesh.position.x < -50) {
            cubeMeshDirectionRight = true;
        }

        if (cubeMeshDirectionRight) {
            cubeMesh.position.x += 0.1;
        } else {
            cubeMesh.position.x -= 0.1;
        }
        cameraManager.update();
    });

    lifeCycle.onDispose.push(() => {
        scene.remove(cubeMesh);
        scene.remove(groundMesh);

        cubeGeometry.dispose();
        cubeMaterial.dispose();
        groundGeometry.dispose();
        groundMaterial.dispose();
        
    });

    cameraManager.enable();
})
onUnmounted(() => {
    cameraManager.disable(); 
})
</script>