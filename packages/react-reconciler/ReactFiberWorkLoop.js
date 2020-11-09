
import beginWork from './ReactFiberBeginWork'

import { completeUnitOfWork } from './ReactFiberCompleteWork'
import {
    createWorkInProgress
} from './ReactFiber';
import {
    commitMutationEffects,
    commitBeforeMutationEffects,
    globalVariables as ReactFiberCommitWorkGlobalVariables
} from './ReactFiberCommitWork';


let workInProgress = null;
let workInProgressRoot = null;

function performUnitOfWork(unitOfWork) {
    const current = unitOfWork.alternate;

    // beginWork会返回fiber.child，不存在next意味着深度优先遍历已经遍历到某个子树的最深层叶子节点
    let next = beginWork(current, unitOfWork);
    // beginWork完成 props的diff已经完成，可以更新momoizedProps
    unitOfWork.memoizedProps = unitOfWork.pendingProps;

    //child为空时向上遍历
    if (!next) {
        // console.log('next',workInProgress.tag)
        next = completeUnitOfWork(unitOfWork);

    }
    return next;
}


function workLoopSync() {
    while (workInProgress) {
        workInProgress = performUnitOfWork(workInProgress);
    }
}

//render阶段的入口
function performSyncWorkOnRoot(fiber) {

    const root = fiber.stateNode;

    if (root !== workInProgressRoot) {
        workInProgressRoot = root;
        //创建当前元素的 alternate fiber
        workInProgress = createWorkInProgress(root.current, null);
    }

    //向下深度优先遍历，为遍历到的每个fiber节点调用beginWork方法
    //创建子Fiber
    workLoopSync();
    // render阶段结束，进入commit阶段
    root.finishedWork = root.current.alternate;

    console.log('root', root)
    commitRootImp(root);
}



// commit阶段的入口，包括如下子阶段：
// before mutation阶段：遍历effect list，执行 DOM操作前触发的钩子
// mutation阶段：遍历effect list，执行effect
function commitRootImp(root) {
    const finishedWork = root.finishedWork;
    console.log('finishedWork',finishedWork)
    if (!finishedWork) {
        return null;
    }

    root.finishedWork = null;

    // 重置Scheduler相关
    root.callbackNode = null;

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
                nextEffect = commitBeforeMutationEffects(nextEffect);
            } catch (e) {
                console.warn('commit before error', e);
                nextEffect = nextEffect.nextEffect;
            }
        } while (nextEffect)

        // mutation阶段
        nextEffect = firstEffect;
        do {
            try {
                nextEffect = commitMutationEffects(root, nextEffect);
            } catch (e) {
                console.warn('commit mutaion error', e);
                nextEffect = nextEffect.nextEffect;
            }
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


export default performSyncWorkOnRoot