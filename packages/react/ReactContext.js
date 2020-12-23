import { REACT_PROVIDER_TYPE, REACT_CONTEXT_TYPE } from 'shared/ReactSymbols';

function createContext(defaultValue) {

    const context = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        // These are circular
        Provider: null,
        Consumer: null,
    }

    context.Provider = {
        $$typeof: REACT_PROVIDER_TYPE,
        _context: context,
    };

    context.Consumer = context;

    return context
}


export default createContext