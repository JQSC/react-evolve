
import { renderWithHooks } from './ReactFiberHooks'
import { HostRoot, IndeterminateComponent, HostComponent, HostText } from 'shared/ReactWorkTags';
import { reconcileChildFibers, mountChildFibers } from './ReactChildFiber'
import { processUpdateQueue } from './ReactUpdateQueue'


function reconcileChildren(current, workInProgress, nextChildren) {
    // 首次渲染时只有root节点存在current，所以只有root会进入reconcile产生effectTag
    // 其他节点会appendAllChildren形成DOM树
    if (current) {
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    } else {
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    }
}

// 生成child fiber
function updateHostRoot(current, workInProgress) {
    // 根据update链表更新state的操作只在HostRoot 和 class组件相关处理中有
    processUpdateQueue(workInProgress, null, null);
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;

    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child
}

function updateFunctionComponent(current, workInProgress, Component) {
    // //同一个组件中多次调用hook
    const nextChildren = renderWithHooks(workInProgress, Component);

    reconcileChildren(current, workInProgress, nextChildren);

    return workInProgress.child

}

function updateHostComponent(current, workInProgress) {
    //debugger
    reconcileChildren(current, workInProgress, workInProgress.pendingProps.children);
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