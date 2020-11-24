import { createWorkInProgress, createFiberFromElement, createFiberFromText } from './ReactFiber'

// 对于协调单一节点过程中，创建的workInProgress需要去掉他的sibling指向
function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.sibling = null;
    clone.index = 0;
    return clone;
}


export function cloneChildFibers(current, workInProgress) {

    let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
    workInProgress.child = newChild;
    newChild.return = workInProgress;

    while (currentChild.sibling) {
        currentChild = currentChild.sibling;
        newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps);
        newChild.return = workInProgress;
    }
    newChild.sibling = null;
}

//协调单一节点的子fiber 创建fiber
function reconcileSingleElement(returnFiber, currentFirstChild, newChild) {
    let child = currentFirstChild;
    //console.log('currentFirstChild',currentFirstChild,newChild)
    //处理旧节点 当child存在时删除与newChild不同的节点
    while (child) {
        if (child.type === newChild.type) {
            // child type未改变，当前节点需要保留
            // 父级下应该只有这一个子节点，将该子节点的兄弟节点删除
            //deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
            // 创建child的workInProgress
            const existing = useFiber(child, newChild.props);
            existing.return = returnFiber;
            return existing;
        }
        child = child.sibling
    }

    const created = createFiberFromElement(newChild);
    created.return = returnFiber;
    return created;
}

function reconcileSingleTextNode(returnFiber, currentFirstChild, newChild) {
    const created = createFiberFromText(newChild);
    created.return = returnFiber;
    return created;
}

// 标志当前fiber需要在commit阶段插入DOM
function placeSingleChild(fiber) {
    // alternate存在表示该fiber已经插入到DOM
    // if (shouldTrackSideEffects && !fiber.alternate) {
    //     fiber.effectTag = Placement;
    // }
    //mount 阶段不设置effectTag
    return fiber;
}

function createChild(returnFiber, newChild) {
    if (typeof newChild === 'number' || typeof newChild === 'string') {
        return reconcileSingleTextNode(returnFiber, null, newChild);
    }
    if (typeof newChild === 'object' && newChild !== null) {
        return reconcileSingleElement(returnFiber, null, newChild);
    }
}

//为每个子项创建fiber diff算法
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let newIdx = 0;
    let previousNewFiber = null;
    let resultingFirstChild = null;

    for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx]);
        //console.log('newFiber: ', newFiber);
        
        if (!previousNewFiber) {
            resultingFirstChild = newFiber;
        } else {
           // console.log('previousNewFiber: ', previousNewFiber);
            previousNewFiber.sibling = newFiber;

        }
        previousNewFiber = newFiber;
    }
    
    return resultingFirstChild;
}

export function reconcileChildren(current, returnFiber, newChild) {
    const currentFirstChild = current && current.child;

    const isObject = typeof newChild === 'object' && newChild !== null;

    //console.log('newChild',newChild)

    if (Array.isArray(newChild)) {
        
        return reconcileChildrenArray(
            returnFiber,
            currentFirstChild,
            newChild
        )
    }
    //debugger
    if (isObject) {
        return placeSingleChild(reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild
        ))
    }
    // 在 beginWork update各类Component时并未处理HostText，这里处理单个HostText
    if (typeof newChild === 'number' || typeof newChild === 'string') {
        return placeSingleChild(reconcileSingleTextNode(
            returnFiber,
            currentFirstChild,
            newChild
        ))
    }


}