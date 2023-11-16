<template>
    <Canvas3d ref="canvas" :options="options" class="w-full h-full block" />
</template>

<script setup>
import Canvas3d from './Canvas3d.vue';

import * as THREE from 'three'
import { ref, onMounted, onUnmounted } from 'vue';
import { useTopDownCamera } from '../../composables/topDownCamera.js';
import { useNavigation } from '../../navigation/navigation.js';
import { agent } from '../../navigation/agent';

const navigation = useNavigation();
const canvas = ref(null);
const cameraManager = useTopDownCamera({
    minZoom: 5,
    maxZoom: 120,
    currentZoom: 20,
    currentPosition: new THREE.Vector3(0, 0, 15),
});
const options = {
    camera: {
        custom: cameraManager.camera,
        rotation: {
            x: -60 * Math.PI / 180,
        },
    },
};

const createPath = (scene) => {
    const redColor = new THREE.Color(0xff0000);
    const groundGeometry = new THREE.PlaneGeometry(5, 5);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: redColor });
    const gridWidth = 20;
    const gridHeight = 3;
    const grid = [];

    for (let x = 0; x < gridWidth; x++) {
        grid[x] = [];
        for (let y = 0; y < gridHeight; y++) {
            const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.position.set(x * 5, 0, y * 5);
            scene.add(groundMesh);
            grid[x][y] = groundMesh;
            navigation.addNode(groundMesh);
        }
    }

    const getRandomNode = () => {
        const x = Math.floor(Math.random() * gridWidth);
        const y = Math.floor(Math.random() * gridHeight);
        return grid[x][y];
    }

    navigation.bake();

    return {
        getRandomNode,
    };
}

onMounted(() => {
    const { scene, lifeCycle } = canvas.value.adapter;
    const clock = new THREE.Clock();

    const gridController = createPath(scene);

    const greenColor = new THREE.Color(0x00ff00);
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: greenColor });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cubeMesh);

    const destCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const destCubeMaterial = new THREE.MeshBasicMaterial({ color: greenColor });
    const destCubeMesh = new THREE.Mesh(destCubeGeometry, destCubeMaterial);
    scene.add(destCubeMesh);

    const cubeAgent = navigation.addAgent(cubeMesh);
    const node = gridController.getRandomNode();
    navigation.moveAgentTo(cubeAgent, node.position.x, node.position.y, node.position.z);
    destCubeMesh.position.set(node.position.x, node.position.y, node.position.z);

    const paths = cubeAgent.getPath()
    console.log(paths);
    
    for (let i = 0; i < paths.length - 1; i++) {
        
        const x1 = paths[i].x;
        const y1 = paths[i].y;
        const z1 = paths[i].z;
        const x2 = paths[i + 1].x;
        const y2 = paths[i + 1].y;
        const z2 = paths[i + 1].z;

        const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
            const points = [];
            points.push(new THREE.Vector3(x1, y1+.1, z1));
            points.push(new THREE.Vector3(x2, y2+.1, z2));

            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const line = new THREE.Line(geometry, material);
            scene.add(line);
    }

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 5);
    scene.add(light);
    /*
    const nodes = navigation.getNodes();
    for (const node of nodes) {
        const x1 = node.object3D.position.x;
        const y1 = node.object3D.position.y;
        const z1 = node.object3D.position.z;

        for (const connection of node.connections) {
            const x2 = connection.object3D.position.x;
            const y2 = connection.object3D.position.y;
            const z2 = connection.object3D.position.z;

            const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const points = [];
            points.push(new THREE.Vector3(x1, y1, z1));
            points.push(new THREE.Vector3(x2, y2, z2));

            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const line = new THREE.Line(geometry, material);
            //scene.add(line);
        }
    }
    */
    
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const _paths = navigation.getPaths();
    let startNode = _paths[1].nodes[1];
    for (const path of _paths) {
        if (path.nodes[0] != startNode) {
            continue;
        }

        for (let i = 0; i < path.nodes.length - 1; i++) {
            const x1 = path.nodes[i].object3D.position.x;
            const y1 = path.nodes[i].object3D.position.y;
            
            const z1 = path.nodes[i].object3D.position.z;
            const x2 = path.nodes[i + 1].object3D.position.x;
            const y2 = path.nodes[i + 1].object3D.position.y;
            const z2 = path.nodes[i + 1].object3D.position.z;
            
            
                const points = [];
                points.push(new THREE.Vector3(x1, y1, z1));
                points.push(new THREE.Vector3(x2, y2, z2));

                const geometry = new THREE.BufferGeometry().setFromPoints(points)
                const line = new THREE.Line(geometry, material);
                scene.add(line);
        }
    }

    lifeCycle.onAnimate.push(() => {
        navigation.update(clock.getElapsedTime());
        cameraManager.update();

    });

    lifeCycle.onDispose.push(() => {
        scene.remove(cubeMesh);
    });

    cameraManager.enable();
})
onUnmounted(() => {
    cameraManager.disable();
})
</script>