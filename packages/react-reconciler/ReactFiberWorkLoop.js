
import beginWork from './ReactFiberBeginWork'
import commitRoot from './ReactFiberCommitWork'
import { createWorkInProgress } from './ReactFiber'
import { completeWork } from './ReactFiberCompleteWork'
import { HostRoot, IndeterminateComponent, HostComponent, HostText } from 'shared/ReactWorkTags';

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
    //console.log('next',next)
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


function performSyncWorkOnRoot(root) {
    
    //创建当前元素的 alternate fiber
    
    workInProgress = createWorkInProgress(root.current, null);

    workInProgressRoot = workInProgress;

    //console.log('workInProgress', workInProgress)
    //向下深度优先遍历，为遍历到的每个fiber节点调用beginWork方法
    //创建子Fiber
    workLoopSync();

    root.finishedWork = workInProgressRoot;

    //当处理完所有子节点后 commit 避免渲染一半任务被打断，屏幕出现断层
    commitRoot(root);
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
