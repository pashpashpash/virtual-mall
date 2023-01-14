// @flow
// react stuff
import * as React from 'react';
import { render } from 'react-dom';

// web3 stuff
import { Web3ReactProvider } from '@web3-react/core';
import { Provider } from 'react-redux';
import configureAppStore from './redux/store';

import Web3 from 'web3';

// =====================
import AppRouting from './routes';

// Stylesheets
// import s from './index.less';
import './less/defaults.less';

const initialState = {};

const Store = configureAppStore(initialState);

const getLibrary = function (provider: Object): Object {
    return new Web3(provider);
};

console.log('>>>>>>>>>>>>>>>>>>>STORE', { Store, getLibrary });

render(
    <Provider store={Store}>
        <Web3ReactProvider getLibrary={getLibrary}>
            <AppRouting />
        </Web3ReactProvider>
    </Provider>,
    document.getElementById('app')
);
