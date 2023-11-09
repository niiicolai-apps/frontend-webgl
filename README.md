# Install

```bash
$ npm install
```

# Usage in development

```bash
$ npm run dev
```

# Usage in other projects

## Install in other projects
```bash
npm install --save niiicolai-apps/frontend-webgl
```

## Update in other projects
```bash
npm update niiicolai-apps/frontend-webgl
```

## Use in Vue files
```vue
<script setup>
import WebGL from 'frontend-webgl';
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
    const { scene, lifeCycle } = canvas.value.adapter;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    lifeCycle.onAnimate.push(() => {
        cube.rotation.x += .01;
        cube.rotation.z += .01;
    });

    lifeCycle.onDispose.push(() => {
        scene.remove(cube);
        geometry.dispose();
        material.dispose();
    });
})
</script>

<template>
    <WebGL.Canvas3D 
        ref="canvas" 
        :options="options"
        class="w-full h-full block"
    />
</template>
```

## Matrix Background
```vue
<script setup>
import WebGL from 'frontend-webgl';
</script>

<template>
    <WebGL.MatrixBgg />
</template>
```