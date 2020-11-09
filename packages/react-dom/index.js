
import ReactRoot from './ReactRoot';

const ReactDOM = {
    render(element, container) {
        const rootFiber = new ReactRoot(container)
        rootFiber.render(element);
    }
}

export default ReactDOM