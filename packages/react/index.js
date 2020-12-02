import createElement from './ReactElement'
import { useState, useEffect } from './ReactHooks'
import ReactCurrentDispatcher from './ReactCurrentDispatcher'

const React = {
    createElement,
    internals: {
        ReactCurrentDispatcher
    },
    useState,
    useEffect
}

export default React