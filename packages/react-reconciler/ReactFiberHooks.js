import * as DOMRenderer from 'reactReconciler';
import ReactSharedInternals from 'shared/ReactSharedInternals';

const { ReactCurrentDispatcher } = ReactSharedInternals;

let currentlyRenderingFiber = null;
let workInProgressHook = null

//分发器 执行update
function dispatchAction(hook,action) {
    let ans = null;
    if (typeof action === 'function') {
        ans = action(hook.memoizedState);
    } else {
        ans = action
    }
    hook.memoizedState = ans
    //update 执行后 重新render
    const rootFiber = {
        dom: currentlyRenderingFiber.parent.dom,
        props: currentlyRenderingFiber.parent.props,
        alternate: currentlyRenderingFiber.parent,
    }

    DOMRenderer.workLoop(rootFiber)
}

const HooksDispatcherOnUpdate = {
    useState() {

        if (!workInProgressHook) {
            workInProgressHook = currentlyRenderingFiber.memoizedState = currentlyRenderingFiber.alternate.memoizedState;
        } else {
            workInProgressHook = workInProgressHook.next
        }

        return [workInProgressHook.memoizedState, workInProgressHook.dispatch]
    }
}

const HooksDispatcherOnMount = {
    useState(initialState) {
        // 设置该hook的初始值
        if (typeof initialState === 'function') {
            initialState = initialState();
        }

        const hook = {
            memoizedState: initialState,
            next: null
        }
        //是否为第一个hook
        if (!workInProgressHook) {
            currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
        } else {
            workInProgressHook =  workInProgressHook.next = hook;
        }

        hook.dispatch = dispatchAction.bind(null,hook);

        return [workInProgressHook.memoizedState, workInProgressHook.dispatch]
    }
}


export function renderWithHooks(workInProgress) {
    currentlyRenderingFiber = workInProgress;
    currentlyRenderingFiber.memoizedState = null;

    const current = workInProgress.alternate;
    ReactCurrentDispatcher.current = current && current.memoizedState ? HooksDispatcherOnUpdate : HooksDispatcherOnMount;

    const children = [workInProgress.type(workInProgress.props)];

     // 下面几个全局变量会在函数调用过程中指向当前fiber内
    //此时重置他代表这个fiber已经处理完了，所以这些全局变量不能再指向该fiber内部
    //currentlyRenderingFiber = null
    workInProgressHook = null;

    return children;
}
