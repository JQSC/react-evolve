import {REACT_ELEMENT_TYPE} from 'shared/ReactSymbols';

function ReactElement(type, key, props) {
    return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        props
    }
}

function createElement(type, config, ...children) {
    //jsx 描述组件内容的一种数据结构
    const props = { ...config };
    if (children.length === 1) {
        props.children = children[0];
    } else if (children.length > 1) {
        props.children = children
    }

    return ReactElement(type, null, props);
}


export default createElement