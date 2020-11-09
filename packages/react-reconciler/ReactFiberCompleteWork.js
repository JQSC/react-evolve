import {
    HostComponent,
    HostRoot,
    HostText
} from 'shared/ReactWorkTags';
import {
    appendInitialChild,
    createInstance,
    createTextInstance,
    finalizeInitialChildren,
    diffProperties
} from 'reactDOM/ReactHostConfig';

import {
    Update
} from 'shared/ReactSideEffectTags';


function markUpdate(workInProgress) {
    workInProgress.effectTag |= Update;
}

// 由于一定是beginWork返回null才会执行completeUnitOfWork，而beginWork始终创建并返回fiber.child
// 所以传入的fiber一定是某个子树的叶子节点
// 返回节点的兄弟节点（如果存在），不存在兄弟节点时递归上一级
export function completeUnitOfWork(workInProgress) {
    do {
        const current = workInProgress.alternate;
        const returnFiber = workInProgress.return;

        // 当前总会返回null
        let next = completeWork(current, workInProgress);

        if (returnFiber) {
            // if (returnFiber && !(returnFiber.effectTag & Incomplete)) {
            // 将完成的fiber的 effect list append到父级fiber上
            // 这样一级级递归上去后，根节点会有一条本次update所有有effect的fiber的list
            // 在执行DOM操作时只需要遍历这条链表而不需要再递归一遍整个fiber树就能执行effect对应DOM操作
            if (!returnFiber.firstEffect) {
                returnFiber.firstEffect = workInProgress.firstEffect;
            }
            if (workInProgress.lastEffect) {
                if (returnFiber.lastEffect) {
                    returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
                }
                returnFiber.lastEffect = workInProgress.lastEffect;
            }
            const effectTag = workInProgress.effectTag;
            if (effectTag) {
                // 如果当前fiber上存在effect，把他附在父fiber effect list的最后
                if (returnFiber.lastEffect) {
                    // 父fiber list 已有effect
                    returnFiber.lastEffect.nextEffect = workInProgress;
                } else {
                    returnFiber.firstEffect = workInProgress;
                }
                returnFiber.lastEffect = workInProgress;
            }
        }
        const sibling = workInProgress.sibling;
        if (sibling) {
            // 当前父fiber下处理完workInProgress，再去处理他的兄弟节点
            return sibling;
        }
        // 兄弟节点也处理完后，向上一级继续处理
        workInProgress = returnFiber;

    } while (workInProgress);
    // while (node) {
    //     if (node.sibling) {
    //         return node.sibling
    //     } else {
    //         node = node.return
    //     }
    // }
    return null
}

function updateHostComponent(current, workInProgress, type, newProps) {
    const oldProps = current.memoizedProps;
    if (oldProps === newProps) {
        return;
    }
    const instance = workInProgress.stateNode;
    // HostComponent单一文本节点会在这里加入updateQueue
    const updatePayload = diffProperties(instance, type, oldProps, newProps);
    // updateQueue的处理会在commitWork中进行
    workInProgress.updateQueue = updatePayload;

    if (updatePayload) {
        markUpdate(workInProgress);
    }
}
// 为 beginWork阶段生成的fiber生成对应DOM，并产生DOM树
//为Fiber节点生成对应的DOM节点
//将子孙DOM节点插入刚生成的DOM节点中
export function completeWork(current, workInProgress) {
    const newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case HostRoot:
            const fiberRoot = workInProgress.stateNode;
            return null;
        case HostComponent:
            const type = workInProgress.type;
            if (current && workInProgress.stateNode) {
                // 非首次渲染，已经存在对应current 和 stateNode
                updateHostComponent(current, workInProgress, type, newProps);
                return null;
            }
            if (!newProps) {
                console.warn('error happen');
                return null;
            }
            // 创建对应DOM节点
            let instance = createInstance(type, newProps);
            // 因为current不存在，走到这里表示是首次渲染，不需要记录每一层的effect，层层更新
            // 只需要一次性把fiber树渲染到页面上
            // appendAllChildren用于将子DOM节点append到创建的DOM节点上（instance）
            // 这样当completeWork递归上去时DOM树其实是从底到顶一层层构建好的，commit阶段只需要把顶层root append到container即可
            appendAllChildren(instance, workInProgress);
            workInProgress.stateNode = instance;
            // 初始化props
            finalizeInitialChildren(instance, type, newProps);
            return null;
        case HostText:
            // TODO 更新流程
            const newText = newProps;
            workInProgress.stateNode = createTextInstance(newText);
            return null;
        default:
            break;
    }
}


// 执行到当前函数之前已经为每个element创建对应的fiber，并且为每个host fiber创建对应的DOM节点
// 该函数会将fiber的所有子节点（chid,child.sibling...）append到fiber对应的DOM节点上（fiber.stateNode）
// 对于每一级HostComponent，该过程会递归上去，这样就能将分散在各自fiber中的DOM节点形成对应的DOM树
export function appendAllChildren(parent, workInProgress) {
    let node = workInProgress.child;
    while (node) {
        if (node.tag === HostComponent || node.tag === HostText) {
            appendInitialChild(parent, node.stateNode);
        } else if (node.child) {
            node.child.return = node;
            node = node.child;
            continue;
        }
        if (node === workInProgress) {
            return;
        }
        while (!node.sibling) {
            if (!node.return || node.return === workInProgress) {
                return;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
}



