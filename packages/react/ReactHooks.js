
import ReactCurrentDispatcher from './ReactCurrentDispatcher';

function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
}

export function useState(initial) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initial);
}
