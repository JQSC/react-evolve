import React from 'react';
import ReactDOM from 'reactDOM'

function App(props) {

    //const [state, setState] = useState(1)

    return (
        <div style="background: salmon">
            <h1>Hello World</h1>
            {/* <button onClick={() => setState(c => c + 1)}>按钮: {state}  </button> */}
            <h2 style="text-align:right">from Chi</h2>
        </div>
    )
}

const container = document.getElementById("app");

ReactDOM.render(<App name="foo" />, container);