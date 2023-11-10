
const isPinch = (touches) => {
    return touches.length === 2;
}

const isDrag = (touches) => {
    return touches.length === 1;
}

export default {
    isPinch,
    isDrag
}