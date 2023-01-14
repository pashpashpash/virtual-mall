// @flow
import { configureStore } from '@reduxjs/toolkit';
// import thunk from "redux-thunk"
import * as UserSlice from './slices/UserSlice';
import * as ErrorSlice from './slices/ErrorSlice';

// const middleware = [ thunk ]

export type RootState = {|
    user: UserSlice.UserState,
    error: ErrorSlice.ErrorState,
|};
// eslint-disable-next-line flowtype/no-weak-types
export default (preloadedState: RootState): function => {
    const store = configureStore({
        reducer: {
            user: UserSlice.default,
            error: ErrorSlice.default,
        },
        middleware: (getDefaultMiddleware: function): function =>
            getDefaultMiddleware({
                serializableCheck: {
                    // Ignore these action types
                    ignoredActions: ['web3/updateWeb3'],
                    // Ignore these paths in the state
                    ignoredPaths: ['web3.contracts'],
                },
            }),
        preloadedState,
    });

    return store;
};
