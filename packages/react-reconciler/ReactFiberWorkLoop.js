
import beginWork from './ReactFiberBeginWork'
import commitRoot from './ReactFiberCommitWork'

function workLoop(rootFiber) {

    let next = beginWork(rootFiber);

    //提交更新
    if (!next) {
        commitRoot(rootFiber)
    }
}


export default workLoop