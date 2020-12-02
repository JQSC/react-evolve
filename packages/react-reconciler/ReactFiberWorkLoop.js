
import beginWork from './ReactFiberBeginWork'
import { flushPassiveEffects } from './ReactFiberCommitWork'
import { createWorkInProgress } from './ReactFiber'
import { completeWork } from './ReactFiberCompleteWork'
import { HostRoot, IndeterminateComponent, HostComponent, HostText } from 'shared/ReactWorkTags';

import {
    commitMutationEffects,
    commitBeforeMutationEffects
} from './ReactFiberCommitWork';

let workInProgress = null;
let workInProgressRoot = null;


//"归"阶段 
/*
1.向上遍历为节点创建dom 
2.创建dom的同时检查child 如果child不为空则将其所有子节点插入到当前dom元素中
3.遍历兄弟节点
*/
function completeUnitOfWork(unitOfWork) {
    workInProgress = unitOfWork;

    while (workInProgress) {
        let current = workInProgress.alternate;
        let returnFiber = workInProgress.return;
        //创建dom 并将其子节点插入到创建的dom中
        completeWork(current, workInProgress);

        //维护effectList处理所有需要更新的节点
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


        //返回兄弟节点或者父节点 因为兄弟节点的子节点还没有生成Fiber
        // 兄弟节点也处理完后，向上一级继续处理
        const sibling = workInProgress.sibling;
        if (sibling) {
            // 当前父fiber下处理完workInProgress，再去处理他的兄弟节点
            return sibling;
        }
        // 兄弟节点也处理完后，向上一级继续处理
        workInProgress = returnFiber;
    }

    return null
}


function performUnitOfWork(unitOfWork) {
    const current = unitOfWork.alternate;

    // beginWork会返回fiber.child，不存在next意味着深度优先遍历已经遍历到某个子树的最深层叶子节点
    let next = beginWork(current, unitOfWork);
    //child为空时向上遍历
    if (!next) {
        next = completeUnitOfWork(unitOfWork);
    }
    return next;
}

//"递"阶段
function workLoopSync() {
    while (workInProgress) {
        workInProgress = performUnitOfWork(workInProgress);
    }
}

function commitRootImp(root) {
    const finishedWork = root.finishedWork;
    if (!finishedWork) {
        return null;
    }

    root.finishedWork = null;

    if (root === workInProgressRoot) {
        // 重置 workInProgress
        workInProgressRoot = null;
        workInProgress = null;
    }
    let firstEffect;
    if (root.effectTag) {
        // 由于根节点的effect list不含有自身的effect，所以当根节点本身存在effect时需要将其append 入 effect list
        if (finishedWork.lastEffect) {
            finishedWork.lastEffect.nextEffect = finishedWork;
            firstEffect = finishedWork.firstEffect;
        } else {
            firstEffect = finishedWork;
        }
    } else {
        // 根节点本身没有effect
        firstEffect = finishedWork.firstEffect;
    }

    let nextEffect;
    if (firstEffect) {
        // before mutation阶段 
        nextEffect = firstEffect;
        do {
            try {
                nextEffect = commitBeforeMutationEffects(nextEffect,root);
            } catch (e) {
                console.warn('commit before error', e);
                nextEffect = nextEffect.nextEffect;
            }
        } while (nextEffect)

        // mutation阶段  dom插入到父节点中
        nextEffect = firstEffect;
        do {
            try {
                nextEffect = commitMutationEffects(root, nextEffect);
            } catch (e) {
                console.warn('commit mutaion error', e);
                nextEffect = nextEffect.nextEffect;
            }
            //nextEffect = commitMutationEffects(root, nextEffect);
        } while (nextEffect)

        // workInProgress tree 现在完成副作用的渲染变成current tree
        // 之所以在 mutation阶段后设置是为了componentWillUnmount触发时 current 仍然指向之前那棵树
        root.current = finishedWork;

        // effectList已处理完，GC
        nextEffect = firstEffect;
        while (nextEffect) {
            const nextNextEffect = nextEffect.next;
            nextEffect.next = null;
            nextEffect = nextNextEffect;
        }

    } else {
        // 无effect
        root.current = finishedWork;
    }
}

function performSyncWorkOnRoot(root) {
    //console.log('firstEffect',root.current.firstEffect)
    // 如果有已过期同步任务，先执行他们
    //flushPassiveEffects(root);

    //创建当前元素的 alternate fiber
    workInProgress = createWorkInProgress(root.current, null);

    workInProgressRoot = workInProgress;

    //console.log('workInProgress', workInProgress)
    //向下深度优先遍历，为遍历到的每个fiber节点调用beginWork方法
    //创建子Fiber
    workLoopSync();
    root.finishedWork = root.current.alternate;;
    //当处理完所有子节点后 commit 避免渲染一半任务被打断，屏幕出现断层
    commitRootImp(root);
}

function markUpdateTimeFromFiberToRoot(fiber) {
    let alternate = fiber.alternate;
    let node = fiber.return;
    let root;
    if (!node && fiber.tag === HostRoot) {
        root = fiber.stateNode;
    } else {
        while (node) {
            alternate = node.alternate;
            if (!node.return && node.tag === HostRoot) {
                root = node.stateNode;
                break;
            }
            node = node.return;
        }
    }
    return root;
}


function scheduleUpdateOnFiber(fiber) {
    const root = markUpdateTimeFromFiberToRoot(fiber);

    if (!root) {
        return;
    }
    performSyncWorkOnRoot(root);
}


export default scheduleUpdateOnFiber
