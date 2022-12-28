export function arrayToTree(nodes, currentState) {
    const topLevelNodes = [];
    const mappedArr = {};
    const currentStateMap = treeToMap(currentState);
    // First map the nodes of the array to an object -> create a hash table.
    for (const node of nodes){
        mappedArr[node.id] = {
            ...node,
            children: []
        };
    }
    for (const id of nodes.map((n)=>n.id
    )){
        if (mappedArr.hasOwnProperty(id)) {
            var ref;
            const mappedElem = mappedArr[id];
            mappedElem.expanded = ((ref = currentStateMap.get(id)) === null || ref === void 0 ? void 0 : ref.expanded) ?? false;
            const parent = mappedElem.parent;
            if (!parent) {
                continue;
            }
            // If the element is not at the root level, add it to its parent array of children.
            const parentIsRoot = !mappedArr[parent.id];
            if (!parentIsRoot) {
                if (mappedArr[parent.id]) {
                    mappedArr[parent.id].children.push(mappedElem);
                } else {
                    mappedArr[parent.id] = {
                        children: [
                            mappedElem
                        ]
                    };
                }
            } else {
                topLevelNodes.push(mappedElem);
            }
        }
    }
    // tslint:disable-next-line:no-non-null-assertion
    const rootId = topLevelNodes.length ? topLevelNodes[0].parent.id : undefined;
    return {
        id: rootId,
        children: topLevelNodes
    };
}
/**
 * Converts an existing tree (as generated by the arrayToTree function) into a flat
 * Map. This is used to persist certain states (e.g. `expanded`) when re-building the
 * tree.
 */ function treeToMap(tree) {
    const nodeMap = new Map();
    function visit(node) {
        nodeMap.set(node.id, node);
        node.children.forEach(visit);
    }
    if (tree) {
        visit(tree);
    }
    return nodeMap;
}