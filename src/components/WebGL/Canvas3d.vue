<template>
    <canvas ref="c"></canvas>
</template>

<script setup>
import * as THREE from 'three'
import { onMounted, onUnmounted, ref, defineExpose } from 'vue'

const c = ref(null)
const adapter = ref(null)
const props = defineProps({
    options: {
        type: Object,
        required: false,
        default: () => ({}),
    },
})

const resizeRendererToDisplaySize = (renderer) => {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

const initialize = () => {
    const canvas = c.value
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })

    let camera;
    if (props.options.camera?.custom) {
        camera = props.options.camera.custom
    } else {
        const fov = props.options.camera?.fov || 75
        const aspect = props.options.camera?.aspect || 2
        const near = props.options.camera?.near || 0.1
        const far = props.options.camera?.far || 5
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    }
    
    camera.position.x = props.options.camera?.position?.x || 0
    camera.position.y = props.options.camera?.position?.y || 0
    camera.position.z = props.options.camera?.position?.z || 0

    camera.rotation.x = props.options.camera?.rotation?.x || 0
    camera.rotation.y = props.options.camera?.rotation?.y || 0
    camera.rotation.z = props.options.camera?.rotation?.z || 0

    const scene = new THREE.Scene()
    const lifeCycle = {
        onAnimate: [],
        onDispose: [],
    }

    const animate = () => {
        requestAnimationFrame(animate)

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        lifeCycle.onAnimate.forEach((fn) => fn())

        renderer.render(scene, camera)
    }

    animate()

    adapter.value = {
        renderer,
        camera,
        scene,
        lifeCycle,
    }
}

onMounted(() => {
    initialize()
})

onUnmounted(() => {
    adapter.value.lifeCycle.onDispose.forEach((fn) => fn())
    const renderer = adapter.value.renderer
    renderer.dispose()
})

defineExpose({ adapter })
</script>