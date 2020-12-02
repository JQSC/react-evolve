import React from 'react';
import ReactDOM from 'reactDOM'


const { useState, useEffect } = React;

function App(props) {

    const [show, setShow] = useState(false)

    const [state, setState] = useState(1)

    useEffect(
        () => {

            console.log('state:', state)
        },
        [state]
    )

    useEffect(
        () => {

            console.log('state222:', state)
        },
        [state]
    )

    return (
        <div style="background: salmon">
            <h1>Hello World{state}</h1>
            {/* {show ? <p>111</p> : null} */}
            <button onClick={() => setShow((a) => !a)}>show: {show}</button>
            <button onClick={() => setState(c => c + 1)}>累加: {state}</button>
            <h2 style="text-align:right">from Chi</h2>
        </div>
    )
}

const container = document.getElementById("app");

ReactDOM.render(<App name="foo" />, container);