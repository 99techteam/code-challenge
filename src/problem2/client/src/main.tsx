import App from './App.tsx';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import store from 'store/configureStore.ts';
import { ThemeProvider } from 'theme/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <ThemeProvider>
            <StrictMode>
                <App />
            </StrictMode>
        </ThemeProvider>
    </Provider>,
);
