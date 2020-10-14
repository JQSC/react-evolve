import ReactCurrentDispatcher from './ReactCurrentDispatcher';

// 这个函数建立了链接用户调用的hook（useXXX）和实际执行的hook（useXXX）的链接
// 具体解释见ReactCurrentDispatcher
function resolveDispatcher() {
    return ReactCurrentDispatcher.current;
}

export function useState(initialState) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
}

export function useEffect(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
}



function useState2(initialState) {
    let hook;

    if (isMount) {
        hook = {
            queue: {
                pending: null
            },
            memoizedState: initialState,
            next: null
        }
        if (!fiber.memoizedState) {
            fiber.memoizedState = hook;
        } else {
            workInProgressHook.next = hook;
        }
        workInProgressHook = hook;
    } else {
        hook = workInProgressHook;
        workInProgressHook = workInProgressHook.next;
    }

    let baseState = hook.memoizedState;
    if (hook.queue.pending) {
        let firstUpdate = hook.queue.pending.next;

        do {
            const action = firstUpdate.action;
            baseState = action(baseState);
            firstUpdate = firstUpdate.next;
        } while (firstUpdate !== hook.queue.pending)

        hook.queue.pending = null;
    }
    hook.memoizedState = baseState;

    return [baseState, dispatchAction.bind(null, hook.queue)];

}
