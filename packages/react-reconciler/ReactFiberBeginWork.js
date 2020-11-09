import { renderWithHooks } from './ReactFiberHooks'
import { mountChildFibers, reconcileChildFibers, cloneChildFibers } from './ReactChildFiber';
import { cloneUpdateQueue, processUpdateQueue } from 'reactReconciler/ReactUpdateQueue';
import {
    FunctionComponent,
    ClassComponent,
    IndeterminateComponent,
    HostRoot,
    HostComponent,
    HostText
} from 'shared/ReactWorkTags';

function bailoutOnAlreadyFinishedWork(current, workInProgress) {
    cloneChildFibers(current, workInProgress);
    return workInProgress.child;
}

function updateHostRoot(current, workInProgress) {

    const nextProps = workInProgress.pendingProps;
    const prevState = current.memoizedState;
    const prevChildren = prevState ? prevState.element : null;

    //克隆updateQueue  为什么在创建workInProgress时不做这一步呢 ?
    cloneUpdateQueue(current, workInProgress);
    // 根据update链表更新state的操作只在HostRoot 和 class组件相关处理中有
    processUpdateQueue(workInProgress, nextProps, null);

    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;

    if (prevChildren === nextChildren) {
        // 当前root state未变化，走优化路径，不需要协调子节点
        return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
    //console.log('workInProgress',workInProgress)
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

// 可能是Class/Function Component，需要先mount后才能知道具体类型
function mountIndeterminateComponent(current, workInProgress, Component) {
    if (current) {
        // TODO indeterminate component只会在 suspended的情况下才会有current
        // 暂不处理
    }
    const props = workInProgress.pendingProps;
    const children = renderWithHooks(null, workInProgress, Component, props);
    // TODO ClassComponent
    // 当前只处理了 FunctionComponent
    workInProgress.tag = FunctionComponent;
    reconcileChildren(null, workInProgress, children);
    return workInProgress.child;
}

// 生成 child fiber
// 返回 child fiber
function updateHostComponent(current, workInProgress) {
    // DOM节点名
    const nextProps = workInProgress.pendingProps;
    let nextChildren = nextProps.children;

    reconcileChildren(
        current,
        workInProgress,
        nextChildren
    )
    return workInProgress.child;
}

//创建下一个fiber节点，与已创建的fiber节点连接构成fiber树
function beginWork(current, workInProgress) {
   // console.log('workInProgress.tag', workInProgress.tag)
    switch (workInProgress.tag) {
        case HostRoot:
            return updateHostRoot(current, workInProgress);
        case IndeterminateComponent:
            // 首次渲染的Class/Function Component会进入该逻辑，
            return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
        case HostComponent:
            return updateHostComponent(current, workInProgress);
    }
}


function reconcileChildren(current, workInProgress, nextChildren) {
    // 首次渲染时只有root节点存在current，所以只有root会进入reconcile产生effectTag
    // 其他节点会appendAllChildren形成DOM树
    if (current) {
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    } else {
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    }

    // console.log('workInProgress.child ',workInProgress )
}


export default beginWork