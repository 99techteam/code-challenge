// Import reducer types from Redux Toolkit
import { combineReducers, Reducer } from '@reduxjs/toolkit';

// Type definition for dynamic reducer object
export interface InjectedReducersType {
    [key: string]: Reducer; // Map string keys to reducer functions
}

// Factory function to create root reducer
export function createReducer(injectedReducers: InjectedReducersType = {}) {
    // Return identity reducer if no reducers provided
    if (Object.keys(injectedReducers).length === 0) {
        return (state = {}) => state;
    }

    // Merge all reducers into single root reducer
    return combineReducers({
        ...injectedReducers, // Spread injected reducers
    });
}
