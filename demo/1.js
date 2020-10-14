
/*
Step I: The createElement Function
Step II: The render Function
Step III: Concurrent Mode
Step IV: Fibers
Step V: Render and Commit Phases
Step VI: Reconciliation
Step VII: Function Components
Step VIII: Hooks

1.维护jsx映射 createElement
2.实现render

3. 循环递归render无法中断，所以需要一种新的设计  Concurrent Mode


*/

function createElement(type, props, ...children) {
    // console.log('type', type, children)
    //jsx 描述组件内容的一种数据结构
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === "object" ? child : createTextElement(child)
            )
        }
    };
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    };
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


let nextUnitOfWork = null
let rootFiber = null
let currentFiber = null
//we need an array to keep track of the nodes we want to remove.
let deletions = null

//hooks 定义的全局变量
let wipFiber = null
let hookIndex = null

function render(element, container) {
    //console.log('element',element)
    //root fiber 结构
    rootFiber = {
        dom: container,
        props: {
            children: [element],
        },
        //记录old fiber  previous commit phase.
        alternate: currentFiber
    }
    //每次渲染前重置deletions
    deletions = [];
    nextUnitOfWork = rootFiber

}

//递归的执行无法中断，无法区分优先级，并占用主进程
/*
current mode 将render细分为一个个小的单元 ，使用requestIdleCallback 循环

*/
function workLoop(deadline) {
    let shouldYield = false
    //console.log(111)
    //存在待更新节点并且render没有被打断
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        //浏览器剩余的闲置时间，此设置目的是为了不影响渲染
        shouldYield = deadline.timeRemaining() < 1
    }

    //提交更新
    if (!nextUnitOfWork && rootFiber) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)


function updateFunctionComponent(fiber) {
    //当前hook所处组件
    hookIndex = 0
    wipFiber = fiber
    //同一个组件中多次调用hook
    wipFiber.hooks = []

    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}


function useState(initial) {

    const oldHook =
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex]
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: []
    }

    
    const actions = oldHook ? oldHook.queue : []


    actions.forEach(action => {
        hook.state = action(hook.state)
    })

    const setState = action => {
        hook.queue.push(action)
        //重新render
        rootFiber = {
            dom: currentFiber.dom, 
            props: currentFiber.props,
            alternate: currentFiber,
        }
        nextUnitOfWork = rootFiber
        deletions = []
    }


    wipFiber.hooks.push(hook)
    hookIndex++
    return [hook.state, setState]
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

/*
add the element to the DOM
create the fibers for the element’s children
select the next unit of work
*/
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


//commit 操作 从跟节点开始渲染
function commitRoot() {
    //console.log('commitRoot',rootFiber)
    deletions.forEach(commitWork)
    commitWork(rootFiber.child)
    //保存最后一次提交的rootFiber
    currentFiber = rootFiber
    rootFiber = null
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
        commitDeletion(fiber, domParent)
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

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent)
    }
}

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

                console.log('eventType',eventType, nextProps[name])
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

//调度更新
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
        }
        if (oldFiber && !sameType) {
            // TODO delete the oldFiber's node
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
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






/*
Function components:
1.fiber 无dom节点
2.children 是需要运行的函数
 
*/
//默认调用createElement
/** @jsx createElement */
function App(props) {

    const [state, setState] = useState(1)

    console.log('state',state)

    return (
        <div style="background: salmon">
            <h1>Hello World  {state}</h1>
            <button onClick={() => setState(c => c + 1)}>按钮: {state}  </button>
            <h2 style="text-align:right">from Chi</h2>
        </div>
    )
}

const container = document.getElementById("app");

render(<App name="foo" />, container);