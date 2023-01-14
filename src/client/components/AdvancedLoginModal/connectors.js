// @flow
import { useState, useEffect } from 'react';
import { InjectedConnector } from '@web3-react/injected-connector';
// import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { useWeb3React } from '@web3-react/core';
// import { LedgerConnector } from '@web3-react/ledger-connector';
// import { TrezorConnector } from '@web3-react/trezor-connector';
// import { LatticeConnector } from '@web3-react/lattice-connector';
// import { FrameConnector } from '@web3-react/frame-connector';
// import { AuthereumConnector } from '@web3-react/authereum-connector';
// import { FortmaticConnector } from '@web3-react/fortmatic-connector';
// import { MagicConnector } from '@web3-react/magic-connector';
// import { TorusConnector } from '@web3-react/torus-connector';
import Portis from '../../../../secret/virtual-mall/portis';
import Infura from '../../../../secret/virtual-mall/infura.js';
// const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
    1: Infura,
};
const supportedChains = [137, 1, 56, 43114];
const PORTIS_DAPP_ID = Portis;

export const injected = new InjectedConnector({
    supportedChainIds: supportedChains,
});

export const portis = new PortisConnector({
    dAppId: PORTIS_DAPP_ID,
    networks: [137, 1],
    config: { scope: ['email'] },
});

// export const network = new NetworkConnector({
//     urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
//     defaultChainId: 1
// })

export const walletconnect = new WalletConnectConnector({
    rpc: { 1: RPC_URLS[1] },
    qrcode: true,
});

export const walletlink = new WalletLinkConnector({
    url: RPC_URLS[1],
    appName: 'Virtual Mall',
    supportedChainIds: supportedChains,
});

export function useEagerConnect() {
    const { activate, active } = useWeb3React();
    const [tried, setTried] = useState(false);

    useEffect(() => {
        injected.isAuthorized().then((isAuthorized: boolean) => {
            if (isAuthorized) {
                activate(injected, undefined, true).catch(() => {
                    setTried(true);
                });
            } else {
                setTried(true);
            }
        });
    }, []); // intentionally only running on mount (make sure it's only mounted once :))

    // if the connection worked, wait until we get confirmation of that to flip the flag
    useEffect(() => {
        if (!tried && active) {
            setTried(true);
        }
    }, [tried, active]);

    return tried;
}

export function useInactiveListener(suppress: boolean = false) {
    const { active, error, activate } = useWeb3React();

    useEffect((): any => {
        const { ethereum } = window;
        if (ethereum && ethereum.on && !active && !error && !suppress) {
            const handleConnect = () => {
                console.log("Handling 'connect' event");
                activate(injected);
            };
            const handleChainChanged = (chainId: string | number) => {
                console.log(
                    "Handling 'chainChanged' event with payload",
                    chainId
                );
                activate(injected);
            };
            const handleAccountsChanged = (accounts: string[]) => {
                console.log(
                    "Handling 'accountsChanged' event with payload",
                    accounts
                );
                if (accounts.length > 0) {
                    activate(injected);
                }
            };
            const handleNetworkChanged = (networkId: string | number) => {
                console.log(
                    "Handling 'networkChanged' event with payload",
                    networkId
                );
                activate(injected);
            };

            ethereum.on('connect', handleConnect);
            ethereum.on('chainChanged', handleChainChanged);
            ethereum.on('accountsChanged', handleAccountsChanged);
            ethereum.on('networkChanged', handleNetworkChanged);

            return () => {
                if (ethereum.removeListener) {
                    ethereum.removeListener('connect', handleConnect);
                    ethereum.removeListener('chainChanged', handleChainChanged);
                    ethereum.removeListener(
                        'accountsChanged',
                        handleAccountsChanged
                    );
                    ethereum.removeListener(
                        'networkChanged',
                        handleNetworkChanged
                    );
                }
            };
        }
    }, [active, error, suppress, activate]);
}
