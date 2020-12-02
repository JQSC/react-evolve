import { IndeterminateComponent, HostText, HostComponent } from 'shared/ReactWorkTags';
import {NoEffect} from 'shared/ReactSideEffectTags';

export function FiberNode(tag, pendingProps, key) {
    // 1 ClassComponent
    // 3 HostRoot
    // 5 HostComponent
    this.tag = tag;
    // prop key
    this.key = key;
    // type字段由React.createElement注入
    // 对于FunctionComponent，指向 fn
    // 对于ClassComponent，指向 class
    // 对于HostComponent，为对应DOM节点的字符串
    this.type = null;
    // 与type同步
    this.elementType = null;

    this.ref = null;

    // 指向父Fiber
    this.return = null;
    // 指向子Fiber
    this.child = null;
    // 指向兄弟Fiber
    this.sibling = null;
    this.effectTag = NoEffect;
    // 对于FunctionComponent，指向 构造函数实例
    // 对于ClassComponent，指向 实例
    // 对于HostComponent，为对应DOM节点
    this.stateNode = null;

    this.pendingProps = pendingProps;

    // 指向前一次render的fiber
    this.alternate = null;
}


// 为 current fiber 创建对应的 alternate fiber
export function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;
    if (!workInProgress) {
        workInProgress = new FiberNode(
            current.tag,
            pendingProps,
            current.key
        );
        workInProgress.stateNode = current.stateNode;
        workInProgress.type = current.type;
        workInProgress.element = current.element;
        workInProgress.elementType = current.elementType;
        current.alternate = workInProgress;
        workInProgress.alternate = current;
    } else {
        workInProgress.pendingProps = pendingProps;

        // 已有alternate的情况重置effect
        workInProgress.effectTag = 0;
        workInProgress.firstEffect = null;
        workInProgress.lastEffect = null;
        workInProgress.nextEffect = null;
    }

    workInProgress.child = current.child;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    // 父级协调的过程中会被覆写
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;

    return workInProgress;
}


export function createFiberFromElement(element) {
    const type = element.type;
    const pendingProps = element.props;

    let fiberTag = IndeterminateComponent;
    // console.log('type',type,element)
    // FunctionComponent ClassComponent 类型都是 function
    if (typeof type === 'string') {
        fiberTag = HostComponent;
    }

    const fiber = new FiberNode(fiberTag, pendingProps, null);
    fiber.type = type;
    fiber.elementType = type;
    return fiber;
}

export function createFiberFromText(text) {

    let fiberTag = HostText;
    const fiber = new FiberNode(fiberTag, text, null);

    return fiber;
}
