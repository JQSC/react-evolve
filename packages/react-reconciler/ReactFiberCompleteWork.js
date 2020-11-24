import { HostRoot, IndeterminateComponent, HostComponent, HostText } from 'shared/ReactWorkTags';


function finalizeInitialChildren(dom, prevProps, nextProps) {
    const isNew = (prev, next) => key =>
        prev[key] !== next[key]
    //是否是对象的属性
    const isGone = (prev, next) => key => !(key in next)
    //事件处理 如果props name中含有on则做不同的处理
    const isEvent = key => key.startsWith("on")
    // Remove old properties
    const isProperty = key => key !== "children" && !isEvent(key)

    //console.log('nextProps', nextProps)
    // rmove all old props
    // Object.keys(prevProps)
    //     .filter(isProperty)
    //     .filter(isGone(prevProps, nextProps))
    //     .forEach(name => {
    //         dom[name] = ""
    //     })
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
    //add new props    
    Object.keys(nextProps)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = nextProps[name]
        })


}



// 创建DOM节点
// TODO 根据 根节点的namespace创建DOM节点，不一定 创建在当前document里
function createElement(type, props) {
    let domElement;
    if (type === 'script') {
        // 通过innerHTML的方式生成的script标签内部脚本不会执行
        const div = document.createElement('div');
        div.innerHTML = '<script></script>';
        domElement = div.removeChild(div.firstChild);
    } else {
        domElement = document.createElement(type);
    }
    return domElement;
}

function appendAllChildren(parent, workInProgress) {
    let node = workInProgress.child;
    //将所有children加入到parent中
    while (node) {
        if (node.tag === HostComponent || node.tag === HostText) {
            parent.appendChild(node.stateNode);
        } else if (node.child) {
            node.child.return = node;
            node = node.child;
            continue;
        }
        //已是最末端节点 开始遍历兄弟节点
        while (!node.sibling) {
            if (!node.return || node.return === workInProgress) {
                return;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }

}

function updateHostComponent(current, workInProgress, type, newProps) {
    const oldProps = current.pendingProps
    if (oldProps === newProps) {
        return;
    }


    //  finalizeInitialChildren(instance, {}, newProps);
}

export function completeWork(current, workInProgress) {
    const type = workInProgress.type;
    const newProps = workInProgress.pendingProps;

    switch (workInProgress.tag) {
        case HostComponent:

            // if (current && workInProgress.stateNode) {
            //     // 非首次渲染，已经存在对应current 和 stateNode
            //     updateHostComponent(current, workInProgress, type, newProps);
            //     return null;
            // }

            // 创建对应DOM节点
            let instance = createElement(type, newProps);
            // 初始化props
            finalizeInitialChildren(instance, {}, newProps);


            //因为是从内向外递归 所以到父节点的时候,子节点已经生成，此时把子节点append到父节点中
            appendAllChildren(instance, workInProgress)
            //console.log('instance', instance)
            workInProgress.stateNode = instance;
            break
        case HostText:
            workInProgress.stateNode = document.createTextNode(newProps);
            break
        default:
            break;

    }
    return null
}
