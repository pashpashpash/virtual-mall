// @flow
import * as React from 'react';
import Page from '../../components/Page';
import Footer from '../../components/Footer';
import Util from '../../Utils';
import s from './index.less';

import { useWeb3React } from '@web3-react/core';
import { useSelector } from 'react-redux';

import AdvancedLoginModal from '../../components/AdvancedLoginModal';

import { ShopInfo } from '../../../protobuf/shop_pb';
import { ShopInfo$AsClass } from '../../../protobuf/shop_pb.flow';

type Props = {
    history: Object,
};

const AdminPage = (props: Props): React.Node => {
    const web3react = useWeb3React();

    const { active, account, chainId, library } = web3react;
    const { userSessionAccount, signedSession } = useSelector(
        (state: any): any => state.user
    );

    const hashParts = props.history.location.hash.split('#');
    const HashId = hashParts[1];

    const handleScroll = (id: string, extra: number) => {
        const element = document.getElementById(id);
        if (!element) return;
        var rect = element.getBoundingClientRect();
        window.scrollTo({
            top: rect.y + extra,
            left: 0,
            behavior: 'smooth',
        });
    };

    const handleAddShop = React.useCallback(() => {
        console.log('Adding new shop!');

        const shop: ShopInfo$AsClass = new ShopInfo();
        shop.setCreatedBy(account);
        console.log('>>>>>>>>>>>> creating new shop', shop.toObject());
        const shopInfoPromise = Util.PostAPI.shop.write(library, account, shop);

        shopInfoPromise.promise
            .then((r) => {
                console.log(
                    '[AdminPage] Successfully created new storefront',
                    r
                );
            })
            .catch((e) => {
                console.log('[AdminPage] Failed to create new storefront', e);
            });
    });

    // check if the user is already logged in and show Message sign flow instead.
    let userLoggedIn = false;
    if (account && signedSession) {
        userLoggedIn = true;
    }

    let page = (
        <AdvancedLoginModal
            isPopover={false}
            closeModal={() => {
                console.log('closing login window');
            }}
            isDarkMode={true}
            callToAction={
                'To begin the Shop creation process, please connect your wallet.'
            }
        />
    );

    if (userLoggedIn) {
        page = (
            <div
                className={s.text}
                style={{
                    height: 500,
                }}>
                <div>Admin Page!</div>
                <div className={s.button} onClick={handleAddShop}>
                    + Add Storefront
                </div>
            </div>
        );
    }

    return (
        <>
            <Page
                pageClass={s.page}
                contentBackgroundClass={s.background}
                contentPreferredWidth={800}
                contentClass={s.pageContent}>
                {page}
            </Page>
        </>
    );
};
export default AdminPage;
