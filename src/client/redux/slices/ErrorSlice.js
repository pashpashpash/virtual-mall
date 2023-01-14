// @flow
import { createSlice } from '@reduxjs/toolkit';


export type ErrorState = {|
    notification: string,
    level: string

|};

const initialState: ErrorState = {
    notification: "",
    level: "info"
}

type ActionType = {|
    type: string,
    // eslint-disable-next-line flowtype/no-weak-types
    payload: any
|};

const web3Slice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setError: (
            state: Object = initialState,
            action: ActionType
        ): Object => {
            state.notification = action.payload
            state.level = "error"
        },
        closeNotification: (
            state: Object = initialState,
            action: ActionType
        ): Object => {
            state.notification = ""
        }
    },

});

const { actions, reducer } = web3Slice;
export const { setError, closeNotification } = actions;
export default reducer;
