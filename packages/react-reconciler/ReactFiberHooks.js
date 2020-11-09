import * as DOMRenderer from 'reactReconciler';
import performSyncWorkOnRoot from 'reactReconciler/ReactFiberWorkLoop'
import ReactSharedInternals from 'shared/ReactSharedInternals';
import { FiberNode } from 'reactReconciler/ReactFiber';

const { ReactCurrentDispatcher } = ReactSharedInternals;

let currentlyRenderingFiber = null;
let workInProgressHook = null

//分发器 执行update
function dispatchAction(hook, action) {
    let ans = null;
    if (typeof action === 'function') {
        ans = action(hook.memoizedState);
    } else {
        ans = action
    }
    hook.memoizedState = ans
    //update 执行后 重新render
    console.log('currentlyRenderingFiber', currentlyRenderingFiber)

    const { dom, props } = currentlyRenderingFiber.return

    const root = new FiberNode(3, props.child, dom);

    root.alternate = currentlyRenderingFiber.return;

    performSyncWorkOnRoot(root)
}

const HooksDispatcherOnUpdate = {
    useState() {
        if (!workInProgressHook) {
            workInProgressHook = currentlyRenderingFiber.memoizedState = currentlyRenderingFiber.alternate.memoizedState;
        } else {
            workInProgressHook = workInProgressHook.next
        }
        console.log('workInProgressHook', workInProgressHook)
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
            workInProgressHook = workInProgressHook.next = hook;
        }

        hook.dispatch = dispatchAction.bind(null, hook);

        return [workInProgressHook.memoizedState, workInProgressHook.dispatch]
    }
}


export function renderWithHooks(current, workInProgress, Component, props) {
    currentlyRenderingFiber = workInProgress;
    currentlyRenderingFiber.memoizedState = null;

    ReactCurrentDispatcher.current = current && current.memoizedState ? HooksDispatcherOnUpdate : HooksDispatcherOnMount;

    const children = Component(props)

    // 下面几个全局变量会在函数调用过程中指向当前fiber内
    //此时重置他代表这个fiber已经处理完了，所以这些全局变量不能再指向该fiber内部
    //currentlyRenderingFiber = null
    workInProgressHook = null;
    return children;
}
