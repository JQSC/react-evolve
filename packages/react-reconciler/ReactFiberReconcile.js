//调度更新 diff
// updating or deleting nodes 所以需要记录上一次的commit alternate
function reconcileChildren(fiber, elements) {

    let index = 0
    let oldFiber = fiber.alternate && fiber.alternate.child;
    let prevSibling = null
    //diff  compare 
    /*
    1.如果old fiber 和new fiber 有相同的type 则只update props
    2.如果type不相同并且是一个新的元素，则创建一个new dom，并且移除old dom
    */

    while (index < elements.length || oldFiber) {
        const element = elements[index]
        //为null 的元素跳过
        if (!element) {
            index++ 
            continue;
        }

        let newFiber = null
        //判断type是否相同
        const sameType =
            oldFiber &&
            element &&
            element.type == oldFiber.type

        if (sameType) {
            // TODO update the node
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: fiber,
                alternate: oldFiber,
                //因为更新方式为commit 所以需要标记更新方式
                effectTag: "UPDATE",
            }
        }
        if (element && !sameType) {
            // TODO add this node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: fiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
            console.log('PLACEMENT')
        }
        if (oldFiber && !sameType) {
            console.log('DELETION', elements, oldFiber.type)
            // TODO delete the oldFiber's node
            oldFiber.effectTag = "DELETION"
            //Fdeletions.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
        //第一个子节点作为child，其他节点作为第一个节点的兄弟节点
        if (index === 0) {
            prevSibling = fiber.child = newFiber

        } else {
            prevSibling = prevSibling.sibling = newFiber
        }
        index++
    }
}


export default reconcileChildren