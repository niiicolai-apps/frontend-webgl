import * as THREE from 'three';

export const agent = (object3D, options={}) => {
    const destination = new THREE.Vector3();
    const velocity = new THREE.Vector3();
    const stoppingDistance = options.stoppingDistance || 0.5;
    const speed = options.speed || .5;
    const path = [];
    let lookAt = options.lookAt || false;
    let __hasDestination = false;

    const update = (delta) => {
        if (!__hasDestination) {
            if (path.length > 0) {
                setNextPath();
            }
            return;
        }

        const distance = object3D.position.distanceTo(destination);
        if (distance < stoppingDistance) {
            __hasDestination = false;
            return;
        }

        velocity.copy(destination)
            .sub(object3D.position)
            .normalize()
            .multiplyScalar(speed);

        object3D.position.add(velocity);
        
        if (lookAt)
            object3D.lookAt(destination);
    }

    const setNextPath = () => {
        if (path.length > 0) {
            const next = path.shift();
            setDestination(next.x, next.y, next.z);
        }
    }

    const setDestination = (x, y, z) => {
        destination.set(x, y, z);
        __hasDestination = true;
    }

    const setPath = (points) => {
        path.length = 0;
        path.push(...points);
    }

    const clearPath = () => {
        path.length = 0;
    }

    const stop = () => {
        __hasDestination = false;
    }

    const getDestination = () => destination;
    const getVelocity = () => velocity;
    const getPath = () => path;
    const hasDestination = () => __hasDestination;
    const hasPath = () => path.length > 0;

    return {
        update,
        setDestination,
        stop,
        getDestination,
        getVelocity,
        hasDestination,
        setPath,
        clearPath,
        hasPath,
        getPath,
    }
}