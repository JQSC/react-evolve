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


function ChildReconciler(shouldTrackSideEffects) {

    function deleteChild(returnFiber, childToDelete) {
        if (!shouldTrackSideEffects) {
            return;
        }
        // Deletion插入在末尾 ？
        const last = returnFiber.lastEffect;
        if (last) {
            last.nextEffect = childToDelete;
            returnFiber.lastEffect = childToDelete;
        } else {
            returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
        }
        childToDelete.nextEffect = null;
        childToDelete.effectTag = Deletion;
    }

    // 将children置为删除
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTrackSideEffects) {
            return;
        }
        let childToDelete = currentFirstChild;
        while (childToDelete) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
        }
        return null;
    }



    //协调单一节点的子fiber 创建fiber
    function reconcileSingleElement(returnFiber, currentFirstChild, newChild) {

        let child = currentFirstChild;
        //console.log('currentFirstChild',currentFirstChild,newChild)
        //处理旧节点 当child存在时删除与newChild不同的节点
        while (child) {
            // 非首次渲染
            if (child.key === newChild.key) {
                if (child.type === newChild.type) {
                    // child type未改变，当前节点需要保留
                    // 父级下应该只有这一个子节点，将该子节点的兄弟节点删除
                    deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                    // 创建child的workInProgress
                    const existing = useFiber(child, newChild.props);
                    existing.return = returnFiber;
                    return existing;
                } else {
                    // 节点的type改变，同时是单一节点，需要将父fiber下所有child标记为删除
                    // 重新走创建新workInProgress的流程
                    deleteRemainingChildren(returnFiber, child);
                    break;
                }
            } else {
                deleteChild(returnFiber, child);
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

    function reconcileChildFibers(returnFiber, current, newChild) {

        const currentFirstChild = current;

        const isObject = typeof newChild === 'object' && newChild !== null;

        //console.log('newChild',newChild)

        if (Array.isArray(newChild)) {

            return reconcileChildrenArray(
                returnFiber,
                currentFirstChild,
                newChild
            )
        }

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

    return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
