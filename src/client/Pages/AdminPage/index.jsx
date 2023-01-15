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

    const [shops, setShops] = React.useState<
        Array<{ id: number, createdBy: string }>
    >([]);

    const queryAndSetShops = React.useCallback(() => {
        const shopInfoPromise = Util.PostAPI.shop.getAllShops(account);
        shopInfoPromise.promise
            .then((r) => {
                console.log('[AdminPage] Successfully read all storefronts', r);
                setShops(r);
            })
            .catch((e) => {
                console.log('[AdminPage] Failed to read storefronts', e);
            });
    }, [setShops]);

    React.useEffect(() => {
        if (account != null) {
            queryAndSetShops();
        }
    }, [account]);

    const handleAddShop = React.useCallback(() => {
        console.log('Adding new shop!');

        const shop: ShopInfo$AsClass = new ShopInfo();
        shop.setCreatedBy(account);
        console.log('>>>>>>>>>>>> creating new shop', shop.toObject());
        const shopInfoPromise = Util.PostAPI.shop.add(library, account, shop);

        shopInfoPromise.promise
            .then((r) => {
                console.log(
                    '[AdminPage] Successfully created new storefront',
                    r
                );
                queryAndSetShops();
            })
            .catch((e) => {
                console.log('[AdminPage] Failed to create new storefront', e);
            });
    });

    const handleDelete = React.useCallback((id) => {
        const shop: ShopInfo$AsClass = new ShopInfo();
        shop.setId(id);
        const shopInfoPromise = Util.PostAPI.shop.delete(
            library,
            account,
            shop
        );
        shopInfoPromise.promise
            .then((r) => {
                console.log(
                    '[AdminPage] Successfully deleted storefront #' + id,
                    r
                );
                queryAndSetShops();
            })
            .catch((e) => {
                console.log(
                    '[AdminPage] Failed to delete storefront #' + id,
                    e
                );
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
            <div className={s.text}>
                <div className={s.button} onClick={handleAddShop}>
                    + Add Storefront
                </div>
                {shops.length > 0 && (
                    <div className={s.row}>
                        <div>Shop ID</div>
                        <div style={{ width: 24 }}></div>
                        <div>Created By</div>
                    </div>
                )}
                {shops.map((shop) => {
                    return (
                        <div className={s.row}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}>
                                <div
                                    className={s.delete}
                                    onClick={handleDelete.bind(this, shop.id)}
                                />
                                <div style={{ width: 24 }}></div>
                                <div>{shop.id}</div>
                            </div>
                            <div style={{ width: 24 }}></div>
                            <div>{shop.createdBy}</div>
                        </div>
                    );
                })}
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
