export let REACT_CONTEXT_TYPE = 0xeace;
export let REACT_PROVIDER_TYPE = 0xeacd;
export let REACT_ELEMENT_TYPE = 0xeac7;

if (typeof Symbol === 'function' && Symbol.for) {
    const symbolFor = Symbol.for;
    REACT_ELEMENT_TYPE = symbolFor('react.element');
    REACT_CONTEXT_TYPE = symbolFor('react.context');
    REACT_PROVIDER_TYPE = symbolFor('react.provider');
}