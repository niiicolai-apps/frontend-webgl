<template>
    <Canvas3d 
        ref="canvas" 
        :options="options" 
        class="w-full h-full block" 
    />
    <div class="fixed bottom-3 left-3">
        <h2>Selected:</h2>
        <pre>{{ selected ? selected.uuid : 'None' }}</pre>
        <button 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            @click="selectableManager.removeSelected()">
            Deselect
        </button>
    </div>
</template>

<script setup>
import Canvas3d from './Canvas3d.vue';

import * as THREE from 'three'
import { ref, onMounted, onUnmounted } from 'vue';
import { useTopDownCamera } from '../../composables/topDownCamera.js';
import { useSelectable } from '../../composables/selectable.js';

const selected = ref(null);
const canvas = ref(null);
const selectableManager = ref(null);
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
    const { renderer, camera, scene, lifeCycle } = canvas.value.adapter;

    selectableManager.value = useSelectable(renderer.domElement, camera, {
        deselectOnDoubleClick: false,
        autoDeselect: true,
        onSelect: (selectable) => {
            console.log('selected', selectable);
            selected.value = selectable;
        },
        onDeselect: (selectable) => {
            console.log('deselected', selectable);
            selected.value = null;
        },
    });
    selectableManager.value.enable();

    const redColor = new THREE.Color(0xff0000);
    const greenColor = new THREE.Color(0x00ff00);

    const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
    const cubeMaterial = new THREE.MeshPhysicalMaterial({ color: greenColor });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.set(0, 2.5, 0);
    scene.add(cubeMesh);
    selectableManager.value.selectables.add(cubeMesh);

    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhysicalMaterial({ color: redColor });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    scene.add(groundMesh);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 10, 0);
    scene.add(light);

    lifeCycle.onAnimate.push(() => {
        cameraManager.update();
    });

    lifeCycle.onDispose.push(() => {
        scene.remove(cubeMesh);
        scene.remove(groundMesh);

        groundGeometry.dispose();
        groundMaterial.dispose();
        cubeGeometry.dispose();
        cubeMaterial.dispose();
    });

    cameraManager.enable();
})
onUnmounted(() => {
    cameraManager.disable(); 
})
</script>