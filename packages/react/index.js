import createElement from './ReactElement'
import createContext from './ReactContext'
import { useState, useEffect, useReducer, useContext } from './ReactHooks'
import ReactCurrentDispatcher from './ReactCurrentDispatcher'

const React = {
    createElement,
    createContext,
    internals: {
        ReactCurrentDispatcher
    },
    useState,
    useReducer,
    useEffect,
    useContext
}

export default React