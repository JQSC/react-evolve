import createElement from './ReactElement'
import createContext from './ReactContext'
import { useState, useEffect, useReducer, useContext, useRef } from './ReactHooks'
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
    useContext,
    useRef
}

export default React