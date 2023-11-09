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
import { ref, onMounted } from 'vue';

const canvas = ref(null);
const options = {
    camera: {
        z: 5,
        far: 1000,
    },
};

onMounted(() => {
    const { scene, renderer, lifeCycle } = canvas.value.adapter;

    const noOfCubes = 100;
    const speed = 0.1;
    const geometry = new THREE.BoxGeometry(.05, .05, .05);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cubes = Array.from({ length: noOfCubes }, () =>
        new THREE.Mesh(geometry, material)
    );

    const width = () => renderer.domElement.clientWidth;
    const height = () => renderer.domElement.clientHeight;

    const randomX = (n=50) => (Math.random() * width() - width() / 2) / n;
    const randomY = (n=50) => (Math.random() * height() - height() / 2) / n;

    const resetPosition = (cube) => {
        cube.position.y = randomY();
        cube.position.x = randomX();
    }

    cubes.forEach((cube, index) => {
        cube.position.x = randomX(10);
        cube.position.y = randomX(10);
        scene.add(cube);
    });

    lifeCycle.onAnimate.push(() => {
        cubes.forEach((cube) => {
            cube.position.y -= speed;

            if (cube.position.y < -height() / 100) {
                resetPosition(cube);
            }
        });
    });

    lifeCycle.onDispose.push(() => {
        cubes.forEach((cube) => {
            scene.remove(cube);
        });

        cubes.length = 0;
        geometry.dispose();
        material.dispose();
    });
})

</script>