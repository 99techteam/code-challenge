import { useInjectReducer as useReducer } from 'redux-injectors';
import { InjectReducerParams, RootStateKeyType } from 'types/injector-typings';

// Wrap redux-injectors with stricter types
export function useInjectReducer<Key extends RootStateKeyType>(params: InjectReducerParams<Key>) {
    return useReducer(params);
}
