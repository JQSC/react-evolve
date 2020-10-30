
import beginWork from './ReactFiberBeginWork'
import commitRoot from './ReactFiberCommitWork'


let workInProgressRoot = null;

function workLoop(rootFiber) {
    if (rootFiber) {
        workInProgressRoot = rootFiber;
    }
    let next = beginWork(workInProgressRoot);

    //提交更新
    if (!next) {
        commitRoot(workInProgressRoot)
    }
}


export default workLoop