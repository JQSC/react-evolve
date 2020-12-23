import React from 'react';
import ReactDOM from 'reactDOM'


const { useState, useEffect, useReducer } = React;

function App(props) {

    const [test, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'increment':
                return state++
            case 'decrement':
                return state-=1
            default:
                throw new Error();
        }
    }, 10)

    const [show, setShow] = useState(false)

    const [state, setState] = useState(1)

    useEffect(
        () => {
            console.log('useEffect state:', state)
        },
        [state]
    )

    useEffect(
        () => {
            console.log('useEffect test:', test)
        },
        [test]
    )


    return (
        <div style="background: salmon">
            <h1>Hello World{state}</h1>
            {/* {show ? <p>111</p> : null} */}
            <button onClick={() => setShow((a) => !a)}>show: {show}</button>
            <button onClick={() => setState(c => c + 1)}>累加: {state}</button>
            <button onClick={() => dispatch({ type: 'decrement' })}>累减: {test}</button>
            <h2 style="text-align:right">from Chi</h2>
        </div>
    )
}

const container = document.getElementById("app");

ReactDOM.render(<App name="foo" />, container);