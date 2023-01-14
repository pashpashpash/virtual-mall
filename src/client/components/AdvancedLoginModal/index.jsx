/* eslint-disable flowtype/no-weak-types */
// @flow
import * as React from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { useSelector, useDispatch } from 'react-redux';
import { injected, portis, walletconnect, walletlink } from './connectors';

import { loginUser, setUserSessionAccount } from '../../redux/slices/UserSlice';

import Util from '../../../client/Utils';
// components
import Popover from '../Popover';
// less
import s from './index.less';

import Promises from '../../Utils/Promises';
import { setError } from '../../redux/slices/ErrorSlice';
import type { RootState } from '../../redux/store';
type Props = {|
    closeModal: Function,
    isPopover: boolean,
    textClass?: string,
    callToAction?: string,
    isDarkMode: boolean,
    handlePortisLogin?: function,
|};

const connectors = [
    {
        txt: 'MetaMask',
        url: 'https://storage.googleapis.com/redeemable-public/img/common/512px-MetaMask_Fox.svg.png',
        deepLinkBase: 'https://metamask.app.link/dapp/',
    },
    {
        txt: 'Portis',
        url: 'https://storage.googleapis.com/redeemable-public/img/common/portis_icon.svg',
        deepLinkBase: undefined,
    },
    {
        txt: 'WalletLink',
        url: 'https://storage.googleapis.com/redeemable-public/img/common/coinbaseWalletLogo256px.png',
        deepLinkBase: 'https://go.cb-w.com/xoXnYwQimhb?cb_url=',
    },
    // { txt: 'WalletConnect', url: '/img/common/walletconnect-square-blue.svg' }, TODO add this connector once it works
];
const connectorsByName = {
    MetaMask: injected,
    Portis: portis,
    WalletLink: walletlink,
    WalletConnect: walletconnect,
};

const AdvancedLoginModal = (props: Props): React.Node => {
    const web3react = useWeb3React();
    const { activate, active, account, library } = web3react;

    const dispatch = useDispatch();

    const { userSessionAccount, signedSession } = useSelector(
        (state: RootState): any => ({
            userSessionAccount: state.user.userSessionAccount,
            signedSession: state.user.signedSession,
        })
    );

    const [activeConnector, setActiveConnector] = React.useState(null);
    const [callbackWasSet, setCallbackWasSet] = React.useState(false);

    // check if the user is already logged in and show Message sign flow instead.
    let showWeb3Login = true;
    if (
        (account && !signedSession) ||
        (account && account !== userSessionAccount)
    ) {
        showWeb3Login = false;
    }

    const [showWeb3Signin, setShowWeb3Signin] = React.useState(showWeb3Login);

    const handleError = (msg: string) => {
        dispatch(setError(msg));
    };

    const handleInjectedButtonClick = (connectorName: string) => {
        setActiveConnector(connectorsByName[connectorName]);
    };

    const handleTryDeepLink = React.useCallback(() => {
        // if connecting in browser fails, open deeplink instead (this happens on mobile browsers)
        const currentConnectorDetails = connectors.find((c) => {
            if (connectorsByName[c.txt] === activeConnector) {
                return true;
            }
        });
        const currentConnectorDeepLink = currentConnectorDetails?.deepLinkBase;
        if (
            typeof currentConnectorDeepLink === 'string' &&
            currentConnectorDeepLink?.length > 0
        ) {
            if (currentConnectorDetails?.txt === 'MetaMask') {
                // todo figure out how to include url params in the metamask deeplink
                window.open(
                    currentConnectorDeepLink +
                        window.location.host +
                        window.location.pathname,
                    '_blank'
                );
            } else {
                window.open(
                    currentConnectorDeepLink +
                        encodeURIComponent(window.location.href),
                    '_blank'
                );
            }
        } else {
            console.log(
                '[AdvancedLoginModal] No deeplink found for connector!',
                { currentConnectorDetails, activeConnector }
            );
        }
    }, [activeConnector]);

    let activatingConnector = null;

    const timer = React.useRef();

    // eslint-disable-next-line flowtype/require-return-type
    React.useEffect(() => {
        // should stop looking for portis if the user logs in using something other than portis
        if (callbackWasSet || active) {
            console.log('[AdvancedLoginModal] Clearing interval');
            clearInterval(timer.current);
            // eslint-disable-next-line flowtype/require-return-type
            return () => clearInterval(timer.current);
        } // checks if the user is logging in with portisand tries to login when the portis object is found
        else if (props.handlePortisLogin && !account) {
            timer.current = setInterval(() => {
                if (portis.portis != null) {
                    if (portis.portis.onLogin) {
                        portis.portis.onLogin(props.handlePortisLogin);
                        portis.portis.provider.enable();
                        setCallbackWasSet(true);
                        console.log('[AdvancedLoginModal] callback was set', {
                            props,
                        });
                    }
                } else {
                    console.log('[AdvancedLoginModal] waiting for portis...');
                }
            }, 1000);
        }
    }, [account, callbackWasSet, props, timer]);

    const handleConnectButton = React.useCallback(() => {
        if (!activate) {
            console.log('[AdvandedLogin] Error Activate undefined');
            handleError('Web3 Error Please try reloading the page');
        }
        if (activeConnector && !active) {
            activatingConnector = Promises.makeCancelable(
                activate(activeConnector, (error: Error) => {
                    console.log(
                        '[AdvancedLoginModal] Error inside activate function',
                        {
                            error,
                            activeConnector,
                        }
                    );
                    if (error.name === 'UnsupportedChainIdError') {
                        handleError(
                            error.message +
                                ' Please switch chains and try again.'
                        );
                        props.closeModal();
                    } else {
                        handleTryDeepLink();
                        handleError('Error activating wallet connector.');
                        setTimeout(() => {
                            setShowWeb3Signin(true);
                        }, 10);
                    }
                })
            );
            activatingConnector.promise
                .then((res): any => {
                    if (signedSession) {
                        props.closeModal();
                    } else {
                        console.log(active);
                        setShowWeb3Signin(false);
                    }
                    activatingConnector = null;
                })
                .catch((err: Error): any => {
                    console.log(
                        '[AdvancedLoginModal] Error activating connector',
                        err
                    );
                });
        } else {
            console.log('[AdvandedLogin] Error no active connector');
            handleError(
                'Please select a wallet and click Connect. Or Make a new account by clicking "Set Up"'
            );
        }
    }, [activeConnector, activate, active, account, library]);

    const setUpNewWallet = React.useCallback(() => {
        if (activeConnector === null) {
            const portisConnector = connectorsByName['Portis'];
            setActiveConnector(portisConnector);
            activatingConnector = Promises.makeCancelable(
                activate(portisConnector, (error: Error) => {
                    console.log(
                        '[AdvancedLoginModal] Error inside activate function',
                        {
                            error,
                            portisConnector,
                        }
                    );
                    handleTryDeepLink();
                    handleError('Error activating wallet connector.');
                    setTimeout(() => {
                        setShowWeb3Signin(true);
                    }, 10);
                })
            );
            activatingConnector.promise
                .then((res): any => {
                    if (signedSession) {
                        props.closeModal();
                    } else {
                        console.log(active);
                        setShowWeb3Signin(false);
                    }
                    activatingConnector = null;
                })
                .catch((err: Error): any => {
                    console.log(
                        '[AdvancedLoginModal] Error activating connector',
                        err
                    );
                });
        } else {
            handleConnectButton();
        }
    }, [activeConnector, handleConnectButton]);

    const handleSignMessageSession = () => {
        if (library) {
            if (account !== userSessionAccount || !signedSession) {
                dispatch(setUserSessionAccount(account));
                // dispatch(fetchUserName({userSessionAccount: account, account, noCache: false}));
                dispatch(loginUser({ web3: library, account }));
            }
        } else {
            handleError(
                'Error No web3 found please reload the page and try again'
            );
        }
    };

    React.useEffect((): function => {
        // if the user is logged in and session is active close modal
        if (active && signedSession) props.closeModal();
        if (active && Util.Cookies.isLoggedIn(account)) {
            dispatch(loginUser({ web3: library, account }));
        } else if (active && account) {
            setShowWeb3Signin(false);
        }
        return () => {
            if (activatingConnector) activatingConnector.cancel();
        };
    }, [active, signedSession, account]);

    const WalletSignin = (
        <div className={s.injectorContainer}>
            {props.callToAction != null && (
                <div
                    style={{ marginBottom: 14 }}
                    className={props.isDarkMode && s.darkModeText}></div>
            )}
            <div className={s.walletButtons}>
                {connectors.map(
                    (connector: { txt: string, url: string }): React.Node => (
                        <div
                            className={[
                                s.connectorBox,
                                connectorsByName[connector.txt] ===
                                    activeConnector && s.connectorBoxSelected,
                            ].join(' ')}
                            key={connector.txt}
                            value={connector.txt}>
                            <div
                                onClick={() => {
                                    handleInjectedButtonClick(connector.txt);
                                }}
                                value={connector.txt}
                                className={s.connectorButton}
                                tabIndex="0">
                                <img
                                    src={connector.url}
                                    alt={connector.txt}
                                    className={s.buttonImg}
                                />
                            </div>
                            <div
                                className={[
                                    s.buttonText,
                                    props.isDarkMode && s.darkModeText,
                                ].join(' ')}>
                                {connector.txt}
                            </div>
                        </div>
                    )
                )}
            </div>
            <div className={[s.bottomButtons].join(' ')}>
                <div
                    className={[
                        s.connectButton,
                        props.isDarkMode && s.darkModeButton,
                    ].join(' ')}
                    onClick={handleConnectButton}>
                    Connect Existing Wallet
                </div>
                <div style={{ minWidth: 10 }}></div>
                <div
                    className={[
                        s.setUpButton,
                        props.isDarkMode && s.darkModeButton,
                    ].join(' ')}
                    onClick={setUpNewWallet}>
                    Setup New Wallet
                </div>
            </div>
        </div>
    );

    const SignMessage = (
        <div className={s.injectorContainer}>
            <h4 className={props.isDarkMode === true && s.darkModeText}>
                Sign a message with your wallet to login
            </h4>
            <p
                style={{ padding: 24 }}
                className={props.isDarkMode === true && s.darkModeText}>
                In order to verify your identity, Web3 accounts use an
                encryption signature. Signing the login message with your Crypto
                wallet does not access your private data.
            </p>
            <div className={s.bottomButtons}>
                <div
                    className={[
                        s.connectButton,
                        props.isDarkMode && s.darkModeButton,
                    ].join(' ')}
                    onClick={handleSignMessageSession}>
                    Sign Message
                </div>
            </div>
        </div>
    );

    return props.isPopover === false ? (
        showWeb3Signin ? (
            WalletSignin
        ) : (
            SignMessage
        )
    ) : (
        <Popover
            startVisible={true}
            onHide={props.closeModal}
            header={
                showWeb3Signin ? 'Connect Wallet' : 'Sign Message to login'
            }>
            {showWeb3Signin ? WalletSignin : SignMessage}
        </Popover>
    );
};

export default AdvancedLoginModal;
