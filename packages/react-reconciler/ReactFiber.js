
function FiberNode() {
    // 1 ClassComponent
    // 3 HostRoot
    // 5 HostComponent
    this.tag = tag;
    // prop key
    this.key = key;
    // 指向父Fiber
    this.return = null;
    // 指向子Fiber
    this.child = null;
    // 指向兄弟Fiber
    this.sibling = null;
    // 对于FunctionComponent，指向 构造函数实例
    // 对于ClassComponent，指向 实例
    // 对于HostComponent，为对应DOM节点
    this.stateNode = null;
    // 指向前一次render的fiber
    this.alternate = null;
}