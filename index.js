import Canvas3D from './src/components/WebGL/Canvas3D.vue';
import MatrixBgg from './src/components/WebGL/MatrixBgg.vue';

import TopDownCameraExample from './src/components/WebGL/TopDownCameraExample.vue';
import { useTopDownCamera } from './src/composables/topDownCamera.js';

import Touches from './src/utils/touches.js';

export default {
    components: {
        Canvas3D,
        MatrixBgg,
        TopDownCameraExample
    },
    composables: {
        useTopDownCamera
    },
    utils: {
        Touches
    }
};