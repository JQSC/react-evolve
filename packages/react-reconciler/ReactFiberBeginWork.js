import reconcileChildren from './ReactFiberReconcile'
import { renderWithHooks } from './ReactFiberHooks'

function updateDom(dom, prevProps, nextProps) {
    const isNew = (prev, next) => key =>
        prev[key] !== next[key]
    //是否是对象的属性
    const isGone = (prev, next) => key => !(key in next)
    //事件处理 如果props name中含有on则做不同的处理
    const isEvent = key => key.startsWith("on")
    // Remove old properties
    const isProperty = key => key !== "children" && !isEvent(key)

    //Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key =>
                !(key in nextProps) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        })

    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)

            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })

    // rmove all old props
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ""
        })
    //add new props    
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })


}

function createDom(fiber) {
    //console.log('props', fiber.props)
    const dom = fiber.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type);

    //增加元素附加属性
    updateDom(dom, {}, fiber.props);

    return dom
}


//存在待更新节点并且render没有被打断
function beginWork(rootFiber) {
    let nextUnitOfWork = rootFiber;
    while (nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
    }
    return nextUnitOfWork
}

function performUnitOfWork(fiber) {

    const isFunctionComponent =
        fiber.type instanceof Function
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

    //child为真返回子节点
    if (fiber.child) {
        return fiber.child
    }
    //child不为真遍历返回兄弟节点
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        //子节点无兄弟节点，则网上查找父节点的兄弟节点
        nextFiber = nextFiber.parent
    }
}


function updateFunctionComponent(currentFiber) {
    // //同一个组件中多次调用hook
    const nextChildren = renderWithHooks(currentFiber);
    reconcileChildren(currentFiber, nextChildren)
}

function updateHostComponent(fiber) {
    //创建 root fiber 、nextUnitOfWork
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    //构建Fiber 以及相连节点的关系
    //更新策略 diff 算法 
    reconcileChildren(fiber, fiber.props.children)
}


export default beginWork