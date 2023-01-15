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

const addWeeksToDate = (dateObj, numberOfWeeks) => {
    dateObj.setDate(dateObj.getDate() + numberOfWeeks * 7);
    return dateObj;
};

const BizPage = (props: Props): React.Node => {
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
        }
    }, [account]);

    const handleShowAllBookings = React.useCallback(() => {
        // frontend hack because I'm the only admin
        if (account === '0xc1D622d588B92D2F7553c6fe66b1Ce6C52ec36f9') {
            const shopInfoPromise = Util.PostAPI.booking.viewAllBookingsAsAdmin(
                library,
                account
            );
            shopInfoPromise.promise
                .then((r) => {
                    console.log(
                        '[BizPage] Successfully read all bookinginfos',
                        r
                    );
                    setBookings(r);
                })
                .catch((e) => {
                    console.log('[BizPage] Failed to read bookinginfos', e);
                });
        } else {
            const shopInfoPromise = Util.PostAPI.booking.viewAllBookingsAsBiz(
                library,
                account
            );
            shopInfoPromise.promise
                .then((r) => {
                    console.log(
                        '[BizPage] Successfully read all bookinginfos',
                        r
                    );
                    setBookings(r);
                })
                .catch((e) => {
                    console.log('[BizPage] Failed to read bookinginfos', e);
                });
        }
    }, [account, library]);

    const handleBan = React.useCallback(
        (bizID) => {
            console.log('[Bizpage] Handling banning business:', bizID);

            const bookingInfo: BookingInfo$AsClass = new BookingInfo();
            bookingInfo.setBiz(bizID);

            const banPromise = Util.PostAPI.admin.banBiz(
                library,
                account,
                bookingInfo
            );
            banPromise.promise
                .then((r) => {
                    console.log(
                        '[BizPage] Successfully banned the following bookings:',
                        r
                    );
                    location.reload();
                })
                .catch((e) => {
                    console.log('[BizPage] Failed to ban bookings', e);
                });
        },
        [account, library]
    );

    const handleScheduleBooking = React.useCallback(
        (shop: Shop, bookings: Array<BookingInfosObject>) => {
            console.log('[BizPage] Handling booking:', { shop, bookings });
            setSelectedShop(shop.id);
        },
        [shops, bookings]
    );

    const [nextAvailable, setNextAvailable] =
        React.useState<BookingInfosObject | null>(null);

    const handleClose = React.useCallback(() => {
        setSelectedShop(null);
        setNextAvailable(null);
    });

    const handleNewBooking = React.useCallback(
        (
            shopID: number | null,
            startInput: string | null,
            endInput: string | null
        ) => {
            if (shopID != null && startInput != null && endInput != null) {
                const bookingInfo: BookingInfo$AsClass = new BookingInfo();
                bookingInfo.setBiz(account);
                bookingInfo.setStart(Number(startInput));
                bookingInfo.setEnd(Number(endInput));
                bookingInfo.setShopId(shopID);

                const bookingPromise = Util.PostAPI.booking.add(
                    library,
                    account,
                    bookingInfo
                );

                bookingPromise.promise
                    .then((r) => {
                        console.log(
                            '[BizPage] Successfully read all bookinginfos',
                            r
                        );
                        handleClose();
                        location.reload();
                    })
                    .catch((e) => {
                        console.log('[BizPage] Failed to read bookinginfos', e);
                    });
            }
        }
    );

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

    const [nextAvailableSlotsLookupMap, setNextSlotsLookupMap] =
        React.useState<{
            [number]: BookingInfosObject,
        } | null>(null);

    console.log('>>>>>>>>>Bookings:', { bookings, bookingsLookupMap });

    function useInput({ placeholder }) {
        const [value, setValue] = React.useState<string | null>('');
        const input = (
            <input
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="text"
                autoComplete={placeholder}
                required
            />
        );
        return [value, input];
    }
    const [start, startInput] = useInput({ placeholder: 'start time' });
    const [end, endInput] = useInput({ placeholder: 'end time' });

    const handleFindNextAvailableSlot = (shopID) => {
        const bookingInfo: BookingInfo$AsClass = new BookingInfo();
        bookingInfo.setShopId(shopID);

        const bookingPromise = Util.PostAPI.booking.nextAvailable(
            library,
            account,
            bookingInfo
        );

        bookingPromise.promise
            .then((r) => {
                console.log('[BizPage] Successfully read all bookinginfos', r);
                setNextAvailable(r);
            })
            .catch((e) => {
                console.log('[BizPage] Failed to read bookinginfos', e);
            });
    };

    const handleFindNextAvailableSlots = () => {
        const shopInfoPromise = Util.PostAPI.booking.nextAvailableAll(
            library,
            account
        );
        shopInfoPromise.promise
            .then((r: Array<BookingInfosObject>) => {
                const lookupMap = {};
                console.log('[BizPage] Successful next available slots', r);
                for (let i = 0; i < r.length; i++) {
                    lookupMap[r[i].shopID] = r[i];
                }
                setNextSlotsLookupMap(lookupMap);
            })
            .catch((e) => {
                console.log('[BizPage] Failed to read slots', e);
            });
    };

    const popover =
        selectedShop != null ? (
            <Popover
                onHide={handleClose}
                className={s.background}
                startVisible={true}>
                <div className={s.popoverWrap}>
                    <div>Timetable for shop {selectedShop}:</div>
                    <div style={{ height: 8 }} />
                    {bookingsLookupMap[selectedShop]?.length > 0 && (
                        <div style={{ textAlign: 'center' }}>
                            {bookingsLookupMap[selectedShop].map((b) => (
                                <div>
                                    <div>
                                        {b.start}-{b.end}
                                    </div>
                                    <div>Booked by: {b.biz}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {bookingsLookupMap[selectedShop]?.length === 0 && (
                        <div>No bookings!</div>
                    )}
                    <div style={{ height: 24 }} />
                    <div className={s.inputs}>
                        {startInput}
                        {endInput}
                    </div>
                    <div style={{ height: 8 }} />
                    <div>Current timestamp: {Date.now()}</div>
                    <div>
                        Week from now: {addWeeksToDate(new Date(), 1).getTime()}
                    </div>
                    <div
                        style={{ color: 'blue', cursor: 'pointer' }}
                        onClick={
                            nextAvailable == null
                                ? handleFindNextAvailableSlot.bind(
                                      this,
                                      selectedShop
                                  )
                                : null
                        }>
                        {nextAvailable == null
                            ? 'View Next Available Timeslot'
                            : `${nextAvailable.start}-${nextAvailable.end}`}
                    </div>
                    <div style={{ height: 24 }} />
                    <div
                        style={{ maxWidth: 398, maxHeight: 82 }}
                        className={s.button}
                        onClick={handleNewBooking.bind(
                            this,
                            selectedShop,
                            start,
                            end
                        )}>
                        Book a time
                    </div>
                </div>
            </Popover>
        ) : null;

    const bookingView = Array.isArray(bookings) && (
        <div className={s.bookings}>
            {shops.map((shop) => (
                <div className={s.row}>
                    <div className={s.shop}>
                        <div
                            className={s.calendarIcon}
                            onClick={handleScheduleBooking.bind(
                                this,
                                shop,
                                bookingsLookupMap[shop.id]
                            )}
                        />
                        <div style={{ width: 24 }} />
                        <div>SHOP: {shop.id}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        {bookingsLookupMap[shop.id].length === 0 && (
                            <div>No bookings!</div>
                        )}
                        {bookingsLookupMap[shop.id].length > 0 && (
                            <div>
                                {bookingsLookupMap[shop.id].map((b) => (
                                    <div>
                                        <div>
                                            {b.start}-{b.end}
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                            Booked by: {b.biz}
                                            {account ===
                                                '0xc1D622d588B92D2F7553c6fe66b1Ce6C52ec36f9' && (
                                                <div
                                                    className={s.delete}
                                                    onClick={handleBan.bind(
                                                        this,
                                                        b.biz
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {nextAvailableSlotsLookupMap != null && (
                            <div>
                                Next Available Slot:{' '}
                                <span>
                                    {nextAvailableSlotsLookupMap[shop.id] !=
                                        null &&
                                        `${
                                            nextAvailableSlotsLookupMap[shop.id]
                                                .start
                                        }-${
                                            nextAvailableSlotsLookupMap[shop.id]
                                                .end
                                        }`}
                                    {nextAvailableSlotsLookupMap[shop.id] ==
                                        null && 'Anytime!'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div style={{ height: 24 }} />
            <div className={s.button} onClick={handleFindNextAvailableSlots}>
                View Next Available Timeslots
            </div>
        </div>
    );

    if (userLoggedIn) {
        page = (
            <div className={s.text}>
                {!Array.isArray(bookings) && (
                    <div className={s.button} onClick={handleShowAllBookings}>
                        View Shops & Schedules
                    </div>
                )}
                {bookingView}
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
                {popover}
            </Page>
        </>
    );
};
export default BizPage;
