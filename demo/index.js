import React from 'react';
import ReactDOM from 'reactDOM'


const { useState, useEffect, useReducer, useContext, createContext } = React;

const Context = createContext(null)

function Index() {

    const [value, setValue] = useState(1)

    return (
        <Context.Provider value={value}>
            <App name="foo" onChange={setValue} />
        </Context.Provider>
    )
}

function App(props) {

    const contextValue = useContext(Context);

    const [test, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'increment':
                return state++
            case 'decrement':
                return state -= 1
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

    //绑定的事件还是旧函数 所以即使函数更新也拿不到最新的值
    const onChange = () => {
       // console.log('state: ', state);
        props.onChange(state);
    }
    


    return (
        <div>
            <h1>Hello World{state}</h1>
            {/* {show ? <p>111</p> : null} */}
            <button onClick={() => setShow((a) => !a)}>show: {show}</button>
            <button onClick={() => setState(c => c + 1)}>累加: {state}</button>
            <button onClick={() => dispatch({ type: 'decrement' })}>累减: {test}</button>

            <button onClick={onChange}>modify context：{contextValue}</button>

        </div>

    )
}

const container = document.getElementById("app");

ReactDOM.render(<Index />, container);