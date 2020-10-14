
import ReactRoot from './ReactRoot';

const ReactDOM = {
    render(element, container) {
        const rootFiber = new ReactRoot(element, container)
        rootFiber.render(rootFiber);
    }
}

export default ReactDOM