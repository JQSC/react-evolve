import * as DOMRenderer from 'reactReconciler';
import performSyncWorkOnRoot from 'reactReconciler/ReactFiberWorkLoop'
import ReactSharedInternals from 'shared/ReactSharedInternals';
import { FiberNode } from 'reactReconciler/ReactFiber';
import {
    NoEffect as NoHookEffect,
    HasEffect as HookHasEffect,
    Layout as HookLayout,
    Passive as HookPassive
} from 'shared/ReactHookEffectTags';

import {
    Update as UpdateEffect,
    Passive as PassiveEffect
} from 'shared/ReactSideEffectTags';

const { ReactCurrentDispatcher } = ReactSharedInternals;

let currentlyRenderingFiber = null;
let workInProgressHook = null
let currentHook;

function createFunctionComponentUpdateQueue() {
    return {
        lastEffect: null
    };
}


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

    DOMRenderer.scheduleUpdateOnFiber(fiber);

}

function mountWorkInProgressHook() {
    const hook = {
        // mount时的初始化state
        memoizedState: null,
        // mount时的初始化state
        baseState: null,
        baseQueue: null,
        queue: null,
        // 指向同一个FunctionComponent中下一个hook，构成链表
        next: null
    }
    if (!workInProgressHook) {
        // 这是list中第一个hook
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {
        // 将该hook append到list最后
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}

// 非首次渲染 和 render阶段触发update造成的重复更新 都会调用该函数
// 用于下面注释的名词解释：
//    hook: 指 React.useState React.useEffect...
//    hook对象：指存储在fiber.memoizedState上的保存hook状态信息的对象
// 该函数返回当前hook对应的hook对象，具体做法是
// 由于hook对象的存储方式是： fiber.memoizedState: hook对象0 -(next)- hook对象1 -- hook对象2
// 每次调用，指针都会向后，只要hook调用顺序不变，就能拿到属于该hook的hook对象
// fiber.memoizedState可能来自2个地方：
// 
function updateWorkInProgressHook() {
    let nextCurrentHook;
    if (!currentHook) {
        // 这次updateComponent进入的第一个renderWithHooks会进入这个逻辑
        let current = currentlyRenderingFiber.alternate;
        if (current) {
            nextCurrentHook = current.memoizedState;
        }
    } else {
        nextCurrentHook = currentHook.next;
    }

    let nextWorkInProgressHook;
    if (!workInProgressHook) {
        // 这次updateComponent进入的第一个renderWithHooks会进入这个逻辑
        nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
    } else {
        // 只遇到过 workInProgressHook.next 值为null
        // workInProgressHook应该是从current复制过来的
        nextWorkInProgressHook = workInProgressHook.next;
    }

    if (nextWorkInProgressHook) {
        // 还没有进过这个逻辑
        workInProgressHook = nextWorkInProgressHook;
        nextWorkInProgressHook = nextWorkInProgressHook.next;
        currentHook = nextCurrentHook;
    } else {
        if (!nextCurrentHook) {
            console.error('比上一次render调用了更多的hook');
        }
        // 从 current hook复制来
        // 即使是同一个FunctionComponent中多个useState，也是进入这个逻辑，workInProgressHook由currentHook复制而来
        currentHook = nextCurrentHook;

        const newHook = {
            memoizedState: currentHook.memoizedState,
            baseState: currentHook.baseState,
            baseQueue: currentHook.baseQueue,
            queue: currentHook.queue,
            next: null
        };
        if (!workInProgressHook) {
            // 这是链表中第一个hook
            currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
        } else {
            workInProgressHook = workInProgressHook.next = newHook;
        }
    }
    return workInProgressHook;
}

// effect对象保存在fiber.updateQueue.lastEffect 链表
function pushEffect(tag, create, destroy, deps) {
    const effect = {
        tag,
        create,
        destroy,
        deps,
        // 环
        next: null
    };
    let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
    if (!componentUpdateQueue) {
        componentUpdateQueue = createFunctionComponentUpdateQueue();
        currentlyRenderingFiber.updateQueue = componentUpdateQueue;
        componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
        const firstEffect = componentUpdateQueue.lastEffect.next;
        componentUpdateQueue.lastEffect.next = effect;
        effect.next = firstEffect;
        componentUpdateQueue.lastEffect = effect;
    }
    return effect;
}

function areHookInputsEqual(nextDeps, prevDeps) {
    if (prevDeps === null) {
      return false;
    }
    if (nextDeps.length !== prevDeps.length) {
      console.error('前后deps长度不一致');
    }
    for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
      if (Object.is(nextDeps[i], prevDeps[i])) {
        continue;
      }
      return false;
    }
    return true;
  }

const HooksDispatcherOnUpdate = {
    useState() {
        let hook = updateWorkInProgressHook();
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
    },
    useEffect(create, deps) {
        const hook = updateWorkInProgressHook();
        const nextDeps = deps === undefined ? null : deps;
        let destroy = undefined;
        if (currentHook) {
        
            const prevEffect = currentHook.memoizedState;
            destroy = prevEffect.destroy;
            if (nextDeps !== null) {
                const prevDeps = prevEffect.deps;
                if (areHookInputsEqual(nextDeps, prevDeps)) {
                    // deps相同，不需要为fiber增加effectTag
                    pushEffect(HookPassive, create, destroy, nextDeps);
                    return;
                }
            }
        }

        // 前后deps不同，增加effectTag
        currentlyRenderingFiber.effectTag |= UpdateEffect | PassiveEffect;
        hook.memoizedState = pushEffect(
            HookHasEffect | HookPassive,
            create,
            destroy,
            nextDeps
        );
    }
}

const HooksDispatcherOnMount = {
    useState(initialState) {
        // 设置该hook的初始值
        if (typeof initialState === 'function') {
            initialState = initialState();
        }

        const hook = mountWorkInProgressHook();
        hook.memoizedState = hook.baseState = initialState;

        //queue 用于多次更新同一个hook
        const queue = hook.queue = {
            pending: null,
            dispatch: null,
            lastRenderedState: initialState
        }

        const dispatch = hook.queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);

        return [hook.memoizedState, dispatch]
    },
    useEffect(create, deps) {
        const hook = mountWorkInProgressHook();
        const nextDeps = deps === undefined ? null : deps;
        //0b00000000100  0b01000000000 
        currentlyRenderingFiber.effectTag |= UpdateEffect | PassiveEffect;
        // 指向effect对象
        //0b001 0b100  = 0b101
        hook.memoizedState = pushEffect(
            HookHasEffect | HookPassive,
            create,
            undefined,
            nextDeps
        );
    }
}


export function renderWithHooks(workInProgress) {

    const current = workInProgress.alternate

    currentlyRenderingFiber = workInProgress;

    currentlyRenderingFiber.memoizedState = null;
    workInProgress.updateQueue = null;

    ReactCurrentDispatcher.current = current && current.memoizedState ? HooksDispatcherOnUpdate : HooksDispatcherOnMount;

    const children = workInProgress.type(workInProgress.props);

    // 下面几个全局变量会在函数调用过程中指向当前fiber内
    //此时重置他代表这个fiber已经处理完了，所以这些全局变量不能再指向该fiber内部
    currentlyRenderingFiber = null
    workInProgressHook = null;
    currentHook = null;

    return children;
}
