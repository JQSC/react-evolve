

//commit 操作 从跟节点开始渲染
function commitRoot(rootFiber) {

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

