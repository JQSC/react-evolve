import * as DOMRenderer from 'reactReconciler';

function ReactRoot(element, container) {
    this.dom = container
    this.props = {
        children: [element]
    }
    //记录old fiber  previous commit phase.
    this.alternate = null
}


ReactRoot.prototype.render = function (rootFiber) {

    DOMRenderer.workLoop(rootFiber)
}


export default ReactRoot