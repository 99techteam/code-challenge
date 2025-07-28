import SwapForm from 'components/swap';
import './App.css';

import { GlobalStyle } from 'theme/global-styles';

function App() {

    return (
        <>
            <GlobalStyle />
            <div>
                <SwapForm/>
            </div>
        </>
    );
}

export default App;
