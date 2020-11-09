import performSyncWorkOnRoot from 'reactReconciler/ReactFiberWorkLoop'
import { FiberNode } from 'reactReconciler/ReactFiber';
import { createUpdate, initializeUpdateQueue, enqueueUpdate } from 'reactReconciler/ReactUpdateQueue';
import { HostRoot } from 'shared/ReactWorkTags';

function ReactRoot(container) {

    this.current = new FiberNode(HostRoot, null, null);
    // 初始化rootFiber的updateQueue
    initializeUpdateQueue(this.current);

    this.current.stateNode = this;
    // 应用挂载的根DOM节点
    this.containerInfo = container;
}

ReactRoot.prototype.render = function (element) {
    const current = this.current;
    const update = createUpdate();
    // fiber.tag为HostRoot类型，payload为对应要渲染的ReactComponents
    update.payload = { element };

    enqueueUpdate(current, update);

    performSyncWorkOnRoot(current);
}


export default ReactRoot