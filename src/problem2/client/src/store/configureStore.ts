// Import required dependencies
import { createReducer } from './reducers';

import { configureStore, StoreEnhancer } from '@reduxjs/toolkit';
import { createInjectorsEnhancer } from 'redux-injectors';
import createSagaMiddleware from 'redux-saga';

// Create Saga middleware instance for handling side effects
const sagaMiddleware = createSagaMiddleware({});

// Extract runSaga function from sagaMiddleware for running sagas
const { run: runSaga } = sagaMiddleware;

// Create injector enhancer to enable dynamic injection of reducers and sagas
const injectorEnhancer = createInjectorsEnhancer({
    runSaga,
    createReducer,
}) as StoreEnhancer;

// Configure middleware array with saga middleware
const middlewares = [sagaMiddleware];

// Create and configure Redux store with middleware and enhancers
const store = configureStore({
    // Set up root reducer
    reducer: createReducer(),

    // Configure middleware with default middleware and custom saga middleware
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(middlewares),

    // Configure enhancers by combining default enhancers with injector enhancer
    enhancers: getDefaultEnhancers => {
        return getDefaultEnhancers().concat(injectorEnhancer);
    },
});

// Export configured store for use in application
export default store;
