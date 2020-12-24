import { HostRoot, IndeterminateComponent, HostComponent, HostText } from 'shared/ReactWorkTags';
import {
    Update
} from 'shared/ReactSideEffectTags';
import {
    appendInitialChild,
    createInstance,
    createTextInstance,
    // finalizeInitialChildren,
    diffProperties
} from 'reactDOM/ReactHostConfig';

// Tag the fiber with an update effect. This turns a Placement into
// a PlacementAndUpdate.
function markUpdate(workInProgress) {
    workInProgress.effectTag |= Update;
}

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
    if (prevProps) {
        Object.keys(prevProps)
            .filter(isProperty)
            .filter(isGone(prevProps, nextProps))
            .forEach(name => {
                dom[name] = ""
            })
        Object.keys(prevProps)
            .filter(isEvent)
            .filter(isNew(prevProps, nextProps))
            .forEach(name => {
                const eventType = name
                    .toLowerCase()
                    .substring(2)

                dom.removeEventListener(
                    eventType,
                    prevProps[name]
                )
            })
    }


    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        // .filter(isNew(prevProps, nextProps))
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

    const instance = workInProgress.stateNode;
    // HostComponent单一文本节点会在这里加入updateQueue
    const updatePayload = diffProperties(instance, type, oldProps, newProps);
    // updateQueue的处理会在commitWork中进行
    workInProgress.updateQueue = updatePayload;

    if (updatePayload) {
        markUpdate(workInProgress);
    }


    //finalizeInitialChildren()
}



export function completeWork(current, workInProgress) {
    const type = workInProgress.type;
    const newProps = workInProgress.pendingProps;

    switch (workInProgress.tag) {
        case HostComponent:

            if (current && workInProgress.stateNode) {
                // 非首次渲染，已经存在对应current 和 stateNode 更新属性
                updateHostComponent(current, workInProgress, type, newProps);
                //console.log('update',workInProgress.stateNode, current.pendingProps, newProps)
                //更新props
                finalizeInitialChildren(workInProgress.stateNode, current.pendingProps, newProps);
                return null;
            }

            // 创建对应DOM节点
            let instance = createInstance(type, newProps);
            // 初始化props
            finalizeInitialChildren(instance, {}, newProps);

            //因为是从内向外递归 所以到父节点的时候,子节点已经生成，此时把子节点append到父节点中
            appendAllChildren(instance, workInProgress)
            //console.log('instance', instance)
            workInProgress.stateNode = instance;
            break
        case HostText:
            const newText = newProps;
            if (current && workInProgress.stateNode != null) {
                const oldText = current && current.pendingProps
                if (oldText !== newText) {
                    markUpdate(workInProgress);
                    //workInProgress.stateNode = createTextInstance(newText);
                }
            } else {
                workInProgress.stateNode = createTextInstance(newText);
            }
            break
        default:
            break;

    }
    return null
}
