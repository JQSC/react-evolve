
import ReactCurrentDispatcher from './ReactCurrentDispatcher';

function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
}

export function useContext(Context) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useContext(Context);
}

export function useState(initial) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initial);
}

export function useEffect(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
}

export function useReducer(reducer, initArg, init) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer, initArg, init);
}


