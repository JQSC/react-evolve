
import * as DOMRenderer from 'reactReconciler';
import { FiberNode } from 'reactReconciler/ReactFiber'
import { HostRoot } from 'shared/ReactWorkTags';
import { initializeUpdateQueue, updateContainer, enqueueUpdate } from 'reactReconciler/ReactUpdateQueue'

class ReactRoot {
    constructor(container) {

        this.current = new FiberNode(HostRoot, null, null);
        //初始化update
        initializeUpdateQueue(this.current);

        this.current.stateNode = this;
        // 应用挂载的根DOM节点
        this.containerInfo = container;

    }
    render(element) {
        const rootFiber = this.current;
        //创建update 开始一次更新
        const update = updateContainer(element);
        // 将生成的update加入updateQueue 在非current mode下 UpdateQueue只会有一个节点
        enqueueUpdate(rootFiber, update);

        //rootFiber.element = element;

        DOMRenderer.scheduleUpdateOnFiber(rootFiber);
    }
}



export default ReactRoot