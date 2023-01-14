/* eslint-disable flowtype/no-weak-types */
// @flow
import * as React from 'react';
import { useWeb3React } from '@web3-react/core';
import { useEagerConnect } from '../AdvancedLoginModal/connectors';
import { useDispatch, useSelector } from 'react-redux';

import Go from '../Go';
import Util from '../../Utils';

import s from './index.less';
import AdvancedLoginModal from '../AdvancedLoginModal';
import type { RootState } from '../../redux/store';
const LOGIN_PROMPT = 'LOGIN & REGISTER';

type Props = {|
    web3?: ?Object,
    account?: ?string,
    networkId?: number,
|};

const AccountNav = (props: Props): React.Node => {
    const web3react = useWeb3React();
    const dispatch = useDispatch();
    const tried = useEagerConnect();
    const { library, account, chainId } = web3react;
    console.log('>>>>>>>>>>>>', { web3react, library, account, chainId });

    const [state, setState] = React.useState({
        hovered: false,
        showLoginModal: false,
    });

    const handleHoverStart = () => {
        setState({ hovered: true }); // TODO un disable hover effects
    };

    const handleHoverEnd = () => {
        setState({ hovered: false });
    };

    const handleClick = (e: SyntheticEvent): boolean => {
        setState({ ...state, showLoginModal: true });
        return true;
    };

    const closeAdvancedLoginModal = (): any => {
        setState({ ...state, showLoginModal: false });
    };

    let prettyAccount = 'Login';
    if (account != null) {
        prettyAccount = Util.Text.prettyEthAccount(account, 6);
    }

    const slideInStyle = {
        // disabled network display for production launch TODO fix
        // right: state.hovered ? '0px' : '-400px',
        right: '-400px',
    };

    const network = 137;
    const transactions = [{ tx: '1' }];

    // const isAdmin = Util.Admin.isStoreManager(props.account);

    return (
        <div className={s.accountNavWrap} onMouseLeave={handleHoverEnd}>
            {state.showLoginModal ? (
                <AdvancedLoginModal closeModal={closeAdvancedLoginModal} />
            ) : (
                <div></div>
            )}
            <div className={s.main}>
                {account != null ? (
                    <Go
                        to={'http://localhost:8100/account/' + account}
                        className={s.accountNav}
                        onMouseEnter={handleHoverStart}
                        data-category="Header Account Nav"
                        data-action={'Account ' + account}>
                        <div className={s.account}>
                            {prettyAccount != null
                                ? prettyAccount
                                : LOGIN_PROMPT}
                        </div>
                    </Go>
                ) : (
                    <div
                        className={s.accountNav}
                        onClick={handleClick}
                        onMouseEnter={handleHoverStart}
                        data-category="Header Account Nav"
                        data-action={'Account ' + account}>
                        <div className={s.account}>
                            {prettyAccount != null
                                ? prettyAccount
                                : LOGIN_PROMPT}
                        </div>
                    </div>
                )}
            </div>

            {/* {chainId !== 1 && (*/}
            <div
                className={[s.subnav, s.network].join(' ')}
                style={slideInStyle}>
                Network: {network || '...'}
            </div>
            {/* )}*/}

            {Object.keys(transactions).map((txHash: string): any => {
                // Dapper cannot provide valid hashes / statuses, I guess
                if (window.providerName === 'dapper') {
                    return null;
                }

                if (txHash == null || txHash === 'undefined') {
                    return null;
                }

                return (
                    <Go
                        to={'https://etherscan.io/tx/' + txHash}
                        data-category="Header Account Nav"
                        data-action={'Etherscan Tx ' + txHash}
                        className={s.subnav}
                        key={txHash}
                        style={slideInStyle}>
                        {'Tx ' +
                            Util.Text.prettyEthAccount(txHash) +
                            ' ' +
                            transactions[txHash].status}
                    </Go>
                );
            })}
        </div>
    );
};

export default AccountNav;
