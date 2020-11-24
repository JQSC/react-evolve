export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

export function getStateFromUpdate(workInProgress, queue, update, prevState, nextProps, instance) {
    switch (update.tag) {
        case UpdateState:
            const payload = update.payload;
            if (!payload) return prevState;
            return Object.assign({}, prevState, payload);
    }
    return prevState;
}

// 通过遍历update链表，根据fiber.tag不同，通过不同的路径计算新的state
export function processUpdateQueue(workInProgress, nextProps, instance) {
    const queue = workInProgress.updateQueue;
    // base update 为 单向非环链表
    let firstBaseUpdate = queue.firstBaseUpdate;
    let lastBaseUpdate = queue.lastBaseUpdate;
    let newState = queue.baseState;

    // 如果有 pendingUpdate，需要将 pendingUpdate单向环状链表剪开并拼在baseUpdate单向链表后面
    let pendingQueue = queue.shared.pending;
    if (pendingQueue) {
        const lastPendingUpdate = pendingQueue;
        const firstPendingUpdate = pendingQueue.next;
        // 将环剪开
        lastPendingUpdate.next = null;
        //重置pending
        queue.shared.pending = null;

        firstBaseUpdate = firstPendingUpdate;
        lastBaseUpdate = lastPendingUpdate
    }
    let update = firstBaseUpdate;
    newState = getStateFromUpdate(workInProgress, queue, update, newState, nextProps, instance);

    queue.baseState = newState;
    queue.firstBaseUpdate = firstBaseUpdate;
    queue.lastBaseUpdate = lastBaseUpdate;

    workInProgress.memoizedState = newState;
}


export function initializeUpdateQueue(fiber) {
    const queue = {
        //本次更新前该Fiber节点的state
        baseState: fiber.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        //本次需要提交的commit
        shared: {
            pending: null,
        },
        //保存update.calback !== null的Update
        effects: null,
    };
    fiber.updateQueue = queue;
}


export function createUpdate() {
    return {
        //更新的类型，包括UpdateState | ReplaceState | ForceUpdate | CaptureUpdate
        tag: UpdateState,
        //更新挂载的数据，不同类型组件挂载的数据不同。对于ClassComponent，payload为this.setState的第一个传参。对于HostRoot，payload为ReactDOM.render的第一个传参
        payload: null,
        //更新的回调函数
        callback: null,
        //与其他Update连接形成链表
        next: null
    };
}


export function updateContainer(element) {
    const update = createUpdate();
    update.payload = { element };
    return update
}

// 将update插入单向环状链表
// 插入 u0 形成 u0 - u0  当前pending: uo
// 插入 u1 形成 u1 - u0 - u1  当前pending: u1
// 插入 u2 形成 u2 - u0 - u1 - u2  当前pending: u2
// 插入 u3 形成 u3 - u0 - u1 - u2 -u3  当前pending: u3
// 故 shared.pending 为 lastPendingUpdate
// shared.pending.next 为 firstPendingUpdate
export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    if (!updateQueue) {
        // fiber已经unmount
        return;
    }

    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;
    // 使新插入的update始终位于单向环状链表首位
    if (!pending) {
        // 这是第一个update，使他形成单向环状链表
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    //最后一个update作为表头
    sharedQueue.pending = update;
}