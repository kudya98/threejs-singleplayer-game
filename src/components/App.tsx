import React, { ReactElement, useState } from 'react'
import Renderer from './Renderer'
import Hud from './Hud'

function App(): ReactElement {
    const [state, setState] = useState({})
    return (
        <div className="app">
            <Hud state={state} />
            <Renderer setState={setState} />
        </div>
    )
}

export default App
