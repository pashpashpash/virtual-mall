// @flow
import * as React from 'react';
import Page from '../../components/Page';
import Footer from '../../components/Footer';
import s from './index.less';

import { useWeb3React } from '@web3-react/core';
import { useSelector } from 'react-redux';

import AdvancedLoginModal from '../../components/AdvancedLoginModal';
import Popover from '../../components/Popover';

import { BookingInfo, BookingInfos } from '../../../protobuf/booking_pb';
import { BookingInfo$AsClass } from '../../../protobuf/booking_pb.flow';

import type { BookingInfo$AsClass$AsObject } from '../../../protobuf/booking_pb.flow';

import Util from '../../Utils';

type Props = {
    history: Object,
};

type BookingInfosObject = {
    start: number,
    end: number,
    shopID: number,
    biz: string,
};

type Shop = { createdBy: string, id: number };

const LandingPage = (props: Props): React.Node => {
    const web3react = useWeb3React();

    const { active, account, chainId, library } = web3react;
    const { userSessionAccount, signedSession } = useSelector(
        (state: any): any => state.user
    );

    const [shops, setShops] = React.useState<Array<Shop>>([]);

    const [selectedShop, setSelectedShop] = React.useState<number | null>(null);

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

    const [bookings, setBookings] =
        React.useState<Array<BookingInfosObject> | null>(null);

    React.useEffect(() => {
        if (account != null) {
            queryAndSetShops();

            const shopInfoPromise =
                Util.PostAPI.booking.viewAllBookingsAsPublic();

            shopInfoPromise.promise
                .then((r) => {
                    console.log(
                        '[LandingPage] Successfully read all bookinginfos',
                        r
                    );
                    setBookings(r);
                })
                .catch((e) => {
                    console.log('[LandingPage] Failed to read bookinginfos', e);
                });
        }
    }, [account]);

    const bookingsLookupMap: {
        [number]: Array<BookingInfosObject>,
    } = {};
    if (Array.isArray(bookings)) {
        for (let i = 0; i < shops.length; i++) {
            bookingsLookupMap[shops[i].id] = [];
        }
        for (let i = 0; i < bookings.length; i++) {
            bookingsLookupMap[bookings[i].shopID]?.push(bookings[i]);
            console.log('>>>>>>>>>>>>>>>', {
                'bookings[i]': bookings[i],
                'bookingsLookupMap[bookings[i].shopID]':
                    bookingsLookupMap[bookings[i].shopID],
            });
        }
        for (let i = 0; i < shops.length; i++) {
            bookingsLookupMap[shops[i].id] = bookingsLookupMap[
                shops[i].id
            ].sort((a, b) => {
                return a.start - b.start;
            });
        }
    }

    console.log('>>>>>>>>>Bookings:', { bookings, bookingsLookupMap });

    const bookingView = Array.isArray(bookings) && (
        <div className={s.bookings}>
            {shops.map((shop) => (
                <div className={s.row}>
                    <div className={s.shop}>
                        <div style={{ width: 24 }} />
                        <div>SHOP: {shop.id}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        {bookingsLookupMap[shop.id].length === 0 && (
                            <div>No current bookings!</div>
                        )}
                        {bookingsLookupMap[shop.id].length > 0 && (
                            <div>
                                {bookingsLookupMap[shop.id].map((b) => (
                                    <div>
                                        <div>
                                            {b.start}-{b.end}
                                        </div>
                                        <div>Booked by: {b.biz}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            <Page
                pageClass={s.page}
                contentBackgroundClass={s.background}
                contentPreferredWidth={800}
                contentClass={s.pageContent}>
                <div className={s.text}>{bookingView}</div>
            </Page>
        </>
    );
};
export default LandingPage;
