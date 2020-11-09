import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';

function ReactElement(type, key, props) {
    const element = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,
        // Built-in properties that belong on the element
        type: type,
        key: key,
        props: props
    };

    return element
}

function createElement(type, config, ...children) {
    let propName;
    
    const props = {};

    let key = null;

    if (config != null) {
        if (config.key !== undefined) {
            key = '' + config.key;
        }
        for (propName in config) {
            if (
                hasOwnProperty.call(config, propName)
            ) {
                props[propName] = config[propName];
            }
        }
    }

    const childrenLength = children.length;
    if (childrenLength == 1) {
        props.children = children[0];
    } else if (childrenLength > 1) {
        props.children = children;
    }

    // Resolve default props
    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;
        for (propName in defaultProps) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    return ReactElement(
        type,
        key,
        props
    );

    //jsx 描述组件内容的一种数据结构
    return {
        type,
        props: {
            ...props,
            child: children.map(child =>
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
            child: []
        }
    };
}


export default createElement