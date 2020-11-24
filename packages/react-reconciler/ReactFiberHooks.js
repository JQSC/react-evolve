import * as DOMRenderer from 'reactReconciler';
import ReactSharedInternals from 'shared/ReactSharedInternals';

const { ReactCurrentDispatcher } = ReactSharedInternals;

let currentlyRenderingFiber = null;
let workInProgressHook = null

//分发器 执行update
function dispatchAction(fiber, queue, action) {

    const update = {
        action,
        next: null
    };

    const pending = queue.pending;
    //pending.next为最新的节点
    if (!pending) {
        update.next = update;
    } else {
        //当前update插入到list尾部，此时pending.next为第一个节点 ，最后一个节点的next 为update
        update.next = pending.next;
        pending.next = update;
    }
    queue.pending = update;

    //console.log(' fiber === currentlyRenderingFiber ', fiber === currentlyRenderingFiber )
    //console.log('fiber: ', fiber);
    DOMRenderer.scheduleUpdateOnFiber(fiber);

}

const HooksDispatcherOnUpdate = {
    useState() {
        // debugger
        if (!workInProgressHook) {
            workInProgressHook = currentlyRenderingFiber.memoizedState = currentlyRenderingFiber.alternate.memoizedState;
        } else {
            workInProgressHook = workInProgressHook.next

        }
        let hook = workInProgressHook
        let queue = hook.queue || {}
        let pendingQueue = queue.pending;
        let baseQueue = hook.baseQueue;
        if (pendingQueue) {
            if (baseQueue) {
                // Merge the pending queue and the base queue.
                const baseFirst = baseQueue.next;
                const pendingFirst = pendingQueue.next;
                baseQueue.next = pendingFirst;
                pendingQueue.next = baseFirst;
            }
            hook.baseQueue = baseQueue = pendingQueue;
            queue.pending = null;
        }

        if (baseQueue) {
            // 需要更新state
            let first = baseQueue.next;
            let newState = hook.baseState;
            // let newBaseState;
            // let newBaseQueueFirst;
            // let newBaseQueueLast;
            let update = first;
            do {
                // TODO 优先级判断
                // TODO 更新baseQueue的逻辑
                const action = update.action;
                newState = action(newState) //reducer(newState, action);
                update = update.next;
            } while (update && update !== first)

            hook.memoizedState = newState;
            hook.baseState = newState;
            hook.baseQueue = null;
            queue.lastRenderedState = newState;
        }
        const dispatch = queue.dispatch;
        //console.log('hook.memoizedState', hook.memoizedState)
        return [hook.memoizedState, dispatch];
    }
}

const HooksDispatcherOnMount = {
    useState(initialState) {
        // 设置该hook的初始值
        if (typeof initialState === 'function') {
            initialState = initialState();
        }

        const hook = {
            //queue代表当前要更新的状态
            queue: null,
            next: null
        }

        hook.memoizedState = hook.baseState = initialState;

        //是否为第一个hook
        if (!workInProgressHook) {
            currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
        } else {
            workInProgressHook = workInProgressHook.next = hook;
        }
        //queue 用于多次更新同一个hook
        const queue = hook.queue = {
            pending: null,
            dispatch: null,
            lastRenderedState: initialState
        }

        const dispatch = hook.queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);

        return [hook.memoizedState, dispatch]
    }
}


export function renderWithHooks(workInProgress) {
    
    currentlyRenderingFiber = workInProgress;

    currentlyRenderingFiber.memoizedState = null;
    workInProgress.updateQueue = null;

    const current = workInProgress.alternate;
    ReactCurrentDispatcher.current = current && current.memoizedState ? HooksDispatcherOnUpdate : HooksDispatcherOnMount;

    const children = workInProgress.type(workInProgress.props);
    
    // 下面几个全局变量会在函数调用过程中指向当前fiber内
    //此时重置他代表这个fiber已经处理完了，所以这些全局变量不能再指向该fiber内部
    currentlyRenderingFiber = null
    workInProgressHook = null;

    return children;
}
