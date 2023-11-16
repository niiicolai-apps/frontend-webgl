import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const coords = new THREE.Vector2();

const selectables = () => {
    const objects = [];

    const add = (object) => {
        objects.push(object);
    }

    const addMany = (...objects) => {
        objects.forEach(object => add(object));
    }

    const remove = (object) => {
        const index = objects.indexOf(object);
        if (index > -1) {
            objects.splice(index, 1);
        }
    }

    const removeMany = (...objects) => {
        objects.forEach(object => remove(object));
    }

    const get = () => {
        return objects;
    }

    return {
        add,
        addMany,
        remove,
        removeMany,
        get
    }
}

const selected = (options={}) => {
    let object = null;

    const set = (value) => {
        if (object && value !== object) {
            if (options.onDeselect) {
                options.onDeselect(object);
            }
        }

        object = value;
        
        if (object && options.onSelect) {
            options.onSelect(object);
        }
    }

    const get = () => {
        return object;
    }

    return {
        set,
        get
    }
}

/**
 * options: {
 *  deselectOnDoubleClick: boolean,
 *  autoDeselect: boolean
 * }
 */
export const useSelectable = (canvas, camera, options={}) => {
    const _selectables = selectables();
    const _selected = selected(options);

    const deselectOnDoubleClick = options.deselectOnDoubleClick !== undefined ? options.deselectOnDoubleClick : true;
    const autoDeselect = options.autoDeselect !== undefined ? options.autoDeselect : true;
    
    const calculateCoords = (e) => {
        coords.x = (e.clientX / canvas.clientWidth) * 2 - 1;
        coords.y = -(e.clientY / canvas.clientHeight) * 2 + 1;
    }

    const findSelection = (e) => {
        raycaster.setFromCamera(coords, camera);
        const intersects = raycaster.intersectObjects(_selectables.get());
        
        if (intersects.length > 0) {
            const newSelected = intersects[0].object;
            if (deselectOnDoubleClick && newSelected === _selected.get()) {
                _selected.set(newSelected);
            } else {
                _selected.set(newSelected);
            }         
        } else {
            if (autoDeselect)
                _selected.set(null);
        }
    }

    const onPointerDown = (e) => {
        calculateCoords(e);
        findSelection(e);
    }

    const enable = () => {
        canvas.addEventListener('pointerdown', onPointerDown);
    }

    const disable = () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
    }

    const setSelected = (object) => {
        _selected.set(object);
    }

    const removeSelected = () => {
        _selected.set(null);
    }

    return {
        selectables: _selectables,
        selected: _selected,
        enable,
        disable,
        setSelected,
        removeSelected
    }
}