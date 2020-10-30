
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

//commit 操作 
function commitRoot(rootFiber) {

    //从根节点递归遍历更新
    commitWork(rootFiber.child)
    //保存最后一次提交的rootFiber
    // currentFiber = rootFiber
    // rootFiber = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }

    //寻找父级dom  当父级为函数时寻找函数的父级
    let domParentFiber = fiber.parent
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber.dom

    if (
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "DELETION") {
        //commitDeletion(fiber, domParent)
    } else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

export default commitRoot

