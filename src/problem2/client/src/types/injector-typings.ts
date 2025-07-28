import type { RootState } from './RootState';

import type { Reducer } from '@reduxjs/toolkit';

// Make all properties in RootState required
type RequiredRootState = Required<RootState>;

// Type for valid keys in RootState
export type RootStateKeyType = keyof RootState;

// Type for injectable reducers
export type InjectedReducersType = {
    [P in RootStateKeyType]?: Reducer<RequiredRootState[P]>;
};

// Interface for reducer injection parameters
export interface InjectReducerParams<Key extends RootStateKeyType> {
    key: Key;
    reducer: Reducer<RequiredRootState[Key]>;
}
