import createElement from './ReactElement'
import { useState } from './ReactHooks'
import ReactCurrentDispatcher from './ReactCurrentDispatcher'

const React = {
    createElement,
    internals: {
        ReactCurrentDispatcher
    },
    useState
}

export default React