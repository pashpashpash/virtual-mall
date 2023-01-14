// @flow
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Utils from '../../Utils';

const UserIndexKey = {
    0: 'username',
    1: 'email',
    2: 'bio',
    3: 'profile_img',
    4: 'website',
};

export const fetchUserById = createAsyncThunk(
    'user/fetchByAccount',
    async (input: {
        account: string,
        myAccount: string,
        noCache: boolean,
    }): Array => {
        const payload = {
            account: input.account,
            data: null,
        };
        try {
            const response = await Utils.PostAPI.user.read(
                input.account,
                input.myAccount,
                input.noCache
            );
            payload.data = response;
            return payload;
        } catch (err) {
            console.log(err);
            payload.data = 'ERR';
            return payload;
        }
    }
);

export const fetchUserName = createAsyncThunk(
    'user/fetchName',
    async (
        data: { account: string, myAccount: string, noCache: boolean },
        thunkAPI
    ): string => {
        try {
            const response = await Utils.PostAPI.user.readName(
                data.account,
                data.myAccount,
                data.noCache
            );
            return response;
        } catch (err) {
            console.log(err);
            return 'ERR';
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/SignedLogin',
    async (data: { web3: Object, account: string }, thunkAPI): any => {
        try {
            if (Utils.Cookies.isLoggedIn(data.account)) {
                console.log('cookie found Logged in');
                return true;
            }
            console.log('[Signature Login] ', data.account);
            const response = await Utils.PostAPI.session.login(
                data.web3,
                data.account
            );
            return response;
        } catch (err) {
            console.log(err);
            return 'ERR';
        }
    }
);

export type UserState = {|
    currentAccount: string,
    userSessionAccount: string,
    signedSession: boolean | string,
    currentUser: Object | null,
    loading: string,
    username: string,
    loadingName: string,
|};

type ActionType = {|
    type: string,
    // eslint-disable-next-line flowtype/no-weak-types
    payload: any,
|};

// Then, handle actions in your reducers:
const usersSlice = createSlice({
    name: 'user',
    initialState: {
        currentAccount: '',
        userSessionAccount: '',
        signedSession: false,
        currentUser: {},
        loading: 'idle',
        username: '',
        loadingName: 'idle',
    },
    reducers: {
        setCurrentAccount: (state: Object, action: ActionType): Object => ({
            ...state,
            currentAccount: action.payload,
        }),
        setUserSessionAccount: (state: Object, action: ActionType): Object => ({
            ...state,
            userSessionAccount: action.payload,
        }),
        resetSignedSession: (state: UserState, action: ActionType): Object => ({
            ...state,
            signedSession: false,
        }),
        resetLoadingName: (state: UserState, action: ActionType): Object => ({
            ...state,
            loadingName: 'idle',
        }),
    },
    // TODO properly type the builder
    // eslint-disable-next-line flowtype/no-weak-types
    extraReducers: (builder: any) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(
            fetchUserById.pending,
            (state: UserState, action: ActionType) => {
                // Add user to the state array
                state.loading = 'pending';
            }
        );
        builder.addCase(
            fetchUserById.fulfilled,
            (state: UserState, action: ActionType) => {
                // Add user to the state array
                if (action.payload.data !== 'ERR') {
                    // set display based on user data
                    const output = {};
                    output[action.payload.account] = {};
                    if (action.payload.data) {
                        action.payload.data.forEach((UserValue: Object) => {
                            const stringKey = UserIndexKey[UserValue.key];
                            // console.log("the key is ", stringKey, UserValue.value)
                            if (UserValue.value) {
                                output[action.payload.account][stringKey] =
                                    UserValue.value;
                            } else {
                                // console.log("undefined data ", stringKey, UserValue)
                                output[action.payload.account][stringKey] =
                                    '......';
                            }
                        });
                    }

                    state.currentUser = {
                        ...state.currentUser,
                        ...output,
                    };
                    state.loading = 'succeeded';
                } else {
                    const failedUser = {};
                    failedUser[action.payload.account] = false;
                    state.currentUser = {
                        ...state.currentUser,
                        ...failedUser,
                    };
                    state.loading = 'failed';
                }
            }
        );
        builder.addCase(
            fetchUserName.pending,
            (state: UserState, action: ActionType) => {
                // Add user to the state array
                state.loadingName = 'pending';
            }
        );
        builder.addCase(
            fetchUserName.fulfilled,
            (state: UserState, action: ActionType) => {
                // Add user to the state array
                if (action.payload !== 'ERR' && action.payload) {
                    state.username = action.payload;
                    state.loadingName = 'succeeded';
                } else {
                    state.loadingName = 'failed';
                }
            }
        );

        builder.addCase(
            loginUser.fulfilled,
            (state: UserState, action: ActionType) => {
                if (action.payload === 'ERR') {
                    state.signedSession = false;
                } else {
                    state.signedSession = true;
                }
            }
        );
    },
});

const { actions, reducer } = usersSlice;
export const {
    setCurrentAccount,
    setUserSessionAccount,
    resetLoadingName,
    resetSignedSession,
} = actions;
export default reducer;
