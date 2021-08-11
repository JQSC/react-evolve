import { createWorkInProgress, createFiberFromElement, createFiberFromText } from './ReactFiber'
import { HostRoot, IndeterminateComponent, HostComponent, HostText } from 'shared/ReactWorkTags';
import {
    Placement,
    Deletion,
    Update
} from 'shared/ReactSideEffectTags';

// 对于协调单一节点过程中，创建的workInProgress需要去掉他的sibling指向
function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.sibling = null;
    clone.index = 0;
    return clone;
}



export function cloneChildFibers(current, workInProgress) {
    const currentChild = workInProgress.child;
    if (!currentChild) return;
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

    function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent) {
        //复用节点
        if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
            deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
            const existing = useFiber(currentFirstChild, textContent);
            existing.return = returnFiber;
            return existing;
        }
        //无法复用 删除所有旧节点创建新节点
        deleteRemainingChildren(returnFiber, currentFirstChild);
        const created = createFiberFromText(textContent);
        created.return = returnFiber;
        return created;
    }

    // 标志当前fiber需要在commit阶段插入DOM
    // 复用的节点有alternate ，新创建的无alternate
    function placeSingleChild(fiber) {
        // 新创建的fiber需要标记Placement ，但mount render的节点只标记跟节点，子节点不处理
        if (shouldTrackSideEffects && !fiber.alternate) {
            fiber.effectTag = Placement;
        }
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

    function updateTextNode(returnFiber, current, textContent) {
        if (!current || current.tag !== HostText) {
            // 插入
            const created = createFiberFromText(textContent);
            created.return = returnFiber;
            return created;
        }
        // 更新
        const existing = useFiber(current, textContent);
        existing.return = returnFiber;
        return existing;
    }

    function updateElement(returnFiber, current, element) {
        if (current) {
            // 更新
            if (current.elementType === element.type) {
                const existing = useFiber(current, element.props);
                existing.return = returnFiber;
                return existing;
            }
        }
        // 插入
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
    }

    //
    function updateSlot(returnFiber, oldFiber, newChild) {
        // 如果key相同则更新fiber，否则返回null
        const key = oldFiber !== null ? oldFiber.key : null;

        if (typeof newChild === 'string' || typeof newChild === 'number') {
            // 文本节点没有key，如果之前的节点有key，代表之前不是文本节点而当前是，可以直接返回
            if (key !== null) {
                return null;
            }
            return updateTextNode(returnFiber, oldFiber, '' + newChild);
        }

        if (typeof newChild === 'object' && newChild !== null) {
            if (newChild.key === key) {
                // key相同，如果type不同会创建新fiber，不复用
                return updateElement(returnFiber, oldFiber, newChild);
            } else {
                // key不同的Component不复用
                return null;
            }
        }
        return null;
    }
    // 将fiber保存为 key:(fiber.key，当key为null时为fiber.index)，value:fiber 的对象
    function mapRemainingChildren(returnFiber, currentFirstChild) {
        const existingChildren = new Map();
        let existingChild = currentFirstChild;
        while (existingChild) {
            if (existingChild.key !== null) {
                existingChildren.set(existingChild.key, existingChild);
            } else {
                existingChildren.set(existingChild.index, existingChild);
            }
            existingChild = existingChild.sibling;
        }
        return existingChildren;
    }
    /** 
     * newFiber 更新的fiber
     * lastPlacedIndex 当前的新fiber数组中已经遍历过的fiber中在上一次更新时的index中最大的那个
     * newIndex 该fiber在新数组中的index
     */
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
        newFiber.index = newIndex;
        if (!shouldTrackSideEffects) {
            return lastPlacedIndex;
        }
        const current = newFiber.alternate;
        if (current) {
            // 节点上次的index
            const oldIndex = current.index;
            if (oldIndex < lastPlacedIndex) {
                // lastPlacedIndex对应的oldFiber对应的newFiber在本次更新中已经遍历过了
                // 所以lastPlacedIndex对应的newFiber在本次更新中是当前要插入的newFiber左边的兄弟节点
                // 所以我们要看看lastPlacedIndex对应的newFiber在上次更新中和newFiber对应上次更新的位置关系
                // oldIndex < lastPlacedIndex 代表newFiber上次的位置是在lastPlacedIndex对应的fiber左边
                // 但是本次更新他在其右边
                // 所以需要标记他Placement
                // 这个移动算法类似插入排序的理念：将要排序的部分分为已排序区和未排序区，每次遍历都将未排序区的一个元素与已排序区元素比较

                // 移动新fiber
                newFiber.effectTag = Placement;
                return lastPlacedIndex;
            } else {
                // 在原地
                return oldIndex;
            }
        } else {
            // 插入
            newFiber.effectTag = Placement;
            return lastPlacedIndex;
        }
    }

    // 通过map中保存的oldFiber和newChild比较，判断是否更新oldFiber或创建新节点
    function updateFromMap(existingChildren, returnFiber, newIdx, newChild) {
        if (typeof newChild === 'string' || typeof newChild === 'number') {
            // 文本节点没有key，只需要比较他们是否都是文本节点
            const matchedFiber = existingChildren.get(newIdx) || null;
            return updateTextNode(returnFiber, matchedFiber, '' + newChild);
        }

        if (typeof newChild === 'object' && newChild !== null) {
            if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
                const matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
                return updateElement(returnFiber, matchedFiber, newChild);
            }
        }

        return null;
    }
    //为每个子项创建fiber diff算法
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
        
        // 可复用节点的位置可能和上次不同（需要标记Placement代表移动） ex： abcd => badc
        // 所以判断完是否可复用后还需要比较index，具体逻辑见 placeChild
        let lastPlacedIndex = 0;

        let newIdx = 0;
        // diff完成后新的第一个child
        let previousNewFiber = null;
        let resultingFirstChild = null;

        // 遍历过程中用于比较的老fiber
        let oldFiber = currentFirstChild;
        let nextOldFiber = null;

        //第一次遍历
        for (; oldFiber && newIdx < newChildren.length; newIdx++) {

            if (oldFiber.index > newIdx) {
                // fiber.index 始终等于该fiber在数组中的索引，即使其前一个兄弟节点是null
                // ex： [null, a] ， 其中 a.index === 1
                // 上次的索引大于这次，代表上次这个节点之前的兄弟节点有null  ex： [null, a] 
                // 假设这次是 [b, a] ，则实际上 diff的是 null -> b   a -> a
                // 所以这里这么赋值
                nextOldFiber = oldFiber;
                oldFiber = null;
            } else {
                nextOldFiber = oldFiber.sibling;
            }

            // 尝试复用节点
            const newFiber = updateSlot(
                returnFiber,
                oldFiber,
                newChildren[newIdx]
            )
            if (newFiber === null) {
                // 该索引对应位置的新节点是 null
                if (!oldFiber) {
                    oldFiber = nextOldFiber;
                }
                break;
            }
            if (shouldTrackSideEffects) {
                //处理key相同type不同情况
                if (oldFiber && !newFiber.alternate) {
                    // oldFiber与newFiber都存在代表对应索引key没变化
                    // !newFiber.alternate代表newFiber是新创建的fiber
                    //   ex：oldFiber: <div key="1"></div> newFiber: <p key="1"></p>
                    //   新旧fiber key相同，则newFiber存在，但是type不同，所以是创建新fiber，没有对应alternate
                    // 插入新DOM节点的同时删掉老的DOM节点
                    deleteChild(returnFiber, oldFiber);
                }
            }

            // 将可复用的新fiber插入，返回插入的索引
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

            if (!previousNewFiber) {
                // 这是第一个插入的新fiber
                resultingFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
        }


        //第二次遍历 情况1 newChildren遍历完，oldFiber没遍历完 标记删除所有剩下的oldFiber
        if (newIdx === newChildren.length) {
            deleteRemainingChildren(returnFiber, oldFiber);
            return resultingFirstChild;
        }
        //情况二 newChildren没遍历完，oldFiber遍历完，标记所有剩下的newChildren为新增
        if (!oldFiber) {
            for (; newIdx < newChildren.length; newIdx++) {
                const newFiber = createChild(returnFiber, newChildren[newIdx]);
                if (!newFiber) {
                    continue;
                }
                lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                    resultingFirstChild = newFiber;
                } else {
                    previousNewFiber.sibling = newFiber;
                }
                previousNewFiber = newFiber;
            }
            return resultingFirstChild;
        }
        //情况三 newChildren与oldFiber都没遍历完，意味着发生了位置变化
        // 将所有未遍历的oldFiber存入map，这样在接下来的遍历中能O(1)的复杂度就能通过key找到对应的oldFiber
        const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
        for (; newIdx < newChildren.length; newIdx++) {
            //从map中寻找可服用的节点
            const newFiber = updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                newChildren[newIdx]
            );
            //找到了可复用的节点
            if (newFiber) {
                if (shouldTrackSideEffects) {
                    if (newFiber.alternate) {
                        // 存在current，代表我们需要复用这个节点，将对应oldFiber从map中删除
                        // 这样该oldFiber就不会置为删除
                        existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
                    }
                }
                lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
                if (!previousNewFiber) {
                    resultingFirstChild = newFiber;
                } else {
                    previousNewFiber.sibling = newFiber;
                }
                previousNewFiber = newFiber;
            }
        }
        if (shouldTrackSideEffects) {
            // 还留下的oldFiber表示没有被复用，需要删除
            existingChildren.forEach(child => deleteChild(returnFiber, child));
        }

        return resultingFirstChild;
    }

    function reconcileChildFibers(returnFiber, current, newChild) {
        // debugger
        const currentFirstChild = current;

        const isObject = typeof newChild === 'object' && newChild !== null;
        

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
        
        // 兜底删除
        return deleteRemainingChildren(returnFiber, currentFirstChild);
    }

    return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
