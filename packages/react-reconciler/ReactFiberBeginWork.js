
import { renderWithHooks } from './ReactFiberHooks'
import { HostRoot, IndeterminateComponent, HostComponent, HostText ,ContextProvider} from 'shared/ReactWorkTags';
import { reconcileChildFibers, mountChildFibers, cloneChildFibers } from './ReactChildFiber'
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
    const prevState = current.memoizedState;
    const prevChildren = prevState ? prevState.element : null;
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;
    if (prevChildren === nextChildren) {
        // 当前root state未变化，走优化路径，不需要协调子节点
        cloneChildFibers(current, workInProgress);

        return workInProgress.child;
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child
}

function updateContextProvider(current$$1, workInProgress) {
    var providerType = workInProgress.type;
    var context = providerType._context;
    var newProps = workInProgress.pendingProps;
    var oldProps = workInProgress.memoizedProps;
    var newValue = newProps.value;

    // pushProvider(workInProgress, newValue);
    context._currentValue = newValue;

    if (oldProps !== null) {
    //   var oldValue = oldProps.value;
    //   var changedBits = calculateChangedBits(context, newValue, oldValue);

    //   if (changedBits === 0) {
    //     // No change. Bailout early if children are the same.
    //     if (oldProps.children === newProps.children && !hasContextChanged()) {
    //       return bailoutOnAlreadyFinishedWork(current$$1, workInProgress);
    //     }
    //   } else {
    //     // The context value changed. Search for matching consumers and schedule
    //     // them to update.
    //     propagateContextChange(workInProgress, context, changedBits);
    //   }
    }

    var newChildren = newProps.children;
    reconcileChildren(current$$1, workInProgress, newChildren);
    return workInProgress.child;
  }


function updateFunctionComponent(current, workInProgress, Component) {
    // //同一个组件中多次调用hook
    const nextChildren = renderWithHooks(workInProgress, Component);

    reconcileChildren(current, workInProgress, nextChildren);

    return workInProgress.child

}

function updateHostComponent(current, workInProgress) {
    // DOM节点名
    const type = workInProgress.type;
    const prevProps = current ? current.memoizedProps : null;
    const nextProps = workInProgress.pendingProps;
    let nextChildren = nextProps.children;

    //debugger
    reconcileChildren(current, workInProgress, nextChildren);
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
        case ContextProvider:
            return updateContextProvider(current, workInProgress);
        default:
            break;

    }

}


export default beginWork