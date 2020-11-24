function createElement(type, config, ...children) {
    //jsx 描述组件内容的一种数据结构
    const props = { ...config };
    if (children.length === 1) {
        props.children = children[0];
    } else if (children.length > 1) {
        props.children = children
    }

    return {
        type,
        props
    };
}


export default createElement