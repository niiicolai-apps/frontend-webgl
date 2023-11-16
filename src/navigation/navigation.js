import * as THREE from 'three';
import { agent } from './agent.js';

const agentController = () => {
    const agents = [];

    const update = (delta) => {
        agents.forEach(agent => agent.update(delta));
    }

    const addAgent = (object3D, options={}) => {
        const a = agent(object3D, options);
        agents.push(a);
        return a;
    }

    const removeAgent = (agent) => {
        const index = agents.indexOf(agent);
        if (index > -1) {
            agents.splice(index, 1);
        }
    }

    const getAgents = () => agents;

    return {
        update,
        addAgent,
        removeAgent,
        getAgents,
    }
}

const nodeController = (connectDistance=0) => {
    const nodes = [];
    

    const addNode = (object3D) => {
        nodes.push({
            object3D,
            connections: [],
        });
    }

    const removeNode = (object3D) => {
        const index = nodes.findIndex(node => node.object3D === object3D);
        if (index > -1) {
            nodes.splice(index, 1);
        }
    }

    const calculateNodeConnections = () => {
        nodes.forEach(node => {
            node.connections.length = 0

            nodes.forEach(other => {
                if (node === other) return;
                const box1 = new THREE.Box3().setFromObject(node.object3D);
                const box2 = new THREE.Box3().setFromObject(other.object3D);
                let distance = node.object3D.position.distanceTo(other.object3D.position);
                distance -= box1.getSize(new THREE.Vector3()).length() / 2;
                distance -= box2.getSize(new THREE.Vector3()).length() / 2;
                if (distance <= connectDistance) {
                    node.connections.push(other);
                }
            });
        });
    }

    const findClosestNode = (x, y, z) => {
        let closest = null;
        let closestDistance = Infinity;
        const otherPosition = new THREE.Vector3(x, y, z);
        nodes.forEach(node => {
            const distance = node.object3D.position.distanceTo(otherPosition);
            if (distance < closestDistance) {
                closest = node;
                closestDistance = distance;
            }
        });
        return closest;
    }

    const getNodes = () => nodes;

    return {
        addNode,
        removeNode,
        calculateNodeConnections,
        findClosestNode,
        getNodes,
    }
}

const pathController = (__nodeController) => {
    const paths = [];

    const calculatePaths = () => {
        paths.length = 0;

        const dfs = (node, visited) => {
            if (visited.includes(node)) return;
            visited.push(node);
            if (visited.length > 1) {
                paths.push({
                    nodes: visited,
                    length: 0,
                });
            }
            node.connections.forEach(connection => {
                if (visited.includes(connection)) return;
                dfs(connection, visited);
            });
        }

        __nodeController.getNodes().forEach(node => {
            const path = [];
            dfs(node, path);
        });

        
        for (const path of paths) {
            let pathLength = 0;

            for (let i = 0; i < path.nodes.length - 1; i++) {
                const node = path.nodes[i];
                const nextNode = path.nodes[i + 1];
                const distance = node.object3D.position.distanceTo(nextNode.object3D.position);
                pathLength += distance;
            }

            path.length = pathLength;
        }

        // Remove duplicate paths
        const uniquePaths = [];
        for (const path of paths) {
            const isUnique = uniquePaths.every(uniquePath => {
                if (uniquePath.nodes.length !== path.nodes.length) return true;
                for (let i = 0; i < path.nodes.length; i++) {
                    if (uniquePath.nodes[i] !== path.nodes[i]) return true;
                }
                return false;
            });
            if (isUnique) uniquePaths.push(path);
        }
        paths.length = 0;
        paths.push(...uniquePaths);
        
        paths.sort((a, b) => a.length - b.length);
        console.log(paths);
    }

    const findPath = (start, end) => {
        // Find a path where the start node is included and moving either forward or backward
        // will reach the end node.
        for (const path of paths) {
            const isStartInPath = path.includes(start);
            const isEndInPath = path.includes(end);
            if (!isStartInPath || !isEndInPath) continue;
            const vector3s = path.map(node => node.object3D.position);
            return vector3s;
        }
        return null;
    }

    const findShortestPath = (start, end) => {
        const validPaths = [];
        for (const path of paths) {
            const isStartInPath = path.nodes.includes(start);
            const isEndInPath = path.nodes.includes(end);
            if (!isStartInPath || !isEndInPath) continue;
            const vector3s = path.nodes.map(node => node.object3D.position);
            // Remove all nodes before the start node
            const startIndex = vector3s.findIndex(v => v === start.object3D.position);
            vector3s.splice(0, startIndex);
            // Remove all nodes after the end node
            const endIndex = vector3s.findIndex(v => v === end.object3D.position);
            vector3s.splice(endIndex + 1);

            if (vector3s.length === 0) continue;

            validPaths.push(vector3s);
        }
        console.log(validPaths);
        if (validPaths.length === 0) 
            return null;

        let shortest = validPaths[0];
        let shortestDistance = Infinity;
        for (const path of validPaths) {
            const distance = path[0].distanceTo(path[path.length - 1]);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                shortest = path;
            }
        }console.log(shortest);
        return shortest;
    }

    const getPaths = () => paths;

    return {
        calculatePaths,
        findPath,
        findShortestPath,
        getPaths,
    }
}

export const useNavigation = () => {
    const agents = [];
    const ac = agentController();
    const nc = nodeController();
    const pc = pathController(nc);

    const addAgent = (object3D, options={}) => {
        if (nc.getNodes().length === 0) {
            throw new Error('No nodes found. Please add nodes before adding agents.');
        }

        const node = options.startNode || nc.getNodes()[0];
        if (!node) return;

        const agent = ac.addAgent(object3D, options);
        object3D.position.copy(node.object3D.position);
        agents.push({ agent, node });
        return agent;
    }

    const removeAgent = (agent) => {
        const index = agents.findIndex(a => a.agent === agent);
        if (index > -1) {
            agents.splice(index, 1);
        }
        ac.removeAgent(agent);
    }

    const addNode = (object3D) => {
        nc.addNode(object3D);
    }

    const removeNode = (object3D) => {
        nc.removeNode(object3D);
    }

    const update = (delta) => {
        ac.update(delta);
    }

    const bake = () => {
        nc.calculateNodeConnections();
        pc.calculatePaths();
    }

    const moveAgentTo = (agent, x, y, z) => {
        console.log(agent, x, y, z);
        const closest = nc.findClosestNode(x, y, z);
        if (!closest) return;
        
        agent = agents.find(a => a.agent === agent);
        if (!agent) return;
        if (!agent.agent) return;
        if (!agent.node) return;

        const path = pc.findShortestPath(agent.node, closest);
        if (!path) return;
        console.log(path);
        agent.agent.setPath(path);  
    }
    
    return {
        update,
        bake,
        moveAgentTo,
        addAgent,
        removeAgent,
        addNode,
        removeNode,
        getNodes: nc.getNodes,
        getPaths: pc.getPaths,
    }
}