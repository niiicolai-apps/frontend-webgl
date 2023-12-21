import Canvas3D from './src/components/WebGL/Canvas3d.vue';
import MatrixBgg from './src/components/WebGL/MatrixBgg.vue';

import TopDownCameraExample from './src/components/WebGL/TopDownCameraExample.vue';
import SelectExample from './src/components/WebGL/SelectExample.vue';

import { useTopDownCamera } from './src/composables/topDownCamera.js';
import { useSelectable } from './src/composables/selectable.js';

import Touches from './src/utils/touches.js';

export default {
    components: {
        Canvas3D,
        MatrixBgg,
        TopDownCameraExample,
        SelectExample
    },
    composables: {
        useTopDownCamera,
        useSelectable
    },
    utils: {
        Touches
    }
};