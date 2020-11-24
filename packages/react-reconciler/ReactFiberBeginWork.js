
import { renderWithHooks } from './ReactFiberHooks'
import { HostRoot, IndeterminateComponent, HostComponent, HostText } from 'shared/ReactWorkTags';
import { reconcileChildren } from './ReactChildFiber'
import { processUpdateQueue } from './ReactUpdateQueue'

// 生成child fiber
function updateHostRoot(current, workInProgress) {
    // 根据update链表更新state的操作只在HostRoot 和 class组件相关处理中有
    processUpdateQueue(workInProgress, null, null);
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;
   
    workInProgress.child = reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child
}

function updateFunctionComponent(current, workInProgress, Component) {
    // //同一个组件中多次调用hook
    const nextChildren = renderWithHooks(workInProgress, Component);
   
    workInProgress.child = reconcileChildren(current, workInProgress, nextChildren);

    return workInProgress.child

}

function updateHostComponent(current, workInProgress) {
    //debugger
    workInProgress.child = reconcileChildren(current, workInProgress, workInProgress.pendingProps.children);
    return workInProgress.child
}

//文本节点无子节点
function updateHostText(current, workInProgress) {
    return null
}

function beginWork(current, workInProgress) {

    //mount阶段
    switch (workInProgress.tag) {
        //跟Fiber
        case HostRoot:
            return updateHostRoot(current, workInProgress);
        //function component
        case IndeterminateComponent:
            const Component = workInProgress.type;
            return updateFunctionComponent(
                current,
                workInProgress,
                Component
            );
        case HostComponent:
            return updateHostComponent(current, workInProgress);
        case HostText:
            return updateHostText(current, workInProgress);
        default:
            break;

    }

}


export default beginWork