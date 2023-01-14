/* eslint-disable flowtype/no-weak-types */
// @flow
// Handy helpers + caching for Nugbase Post API

import Promises from './Promises';
import Web3 from 'web3';

import { ShopInfo, ShopInfos } from '../../protobuf/shop_pb';
import { ShopInfo$AsClass } from '../../protobuf/shop_pb.flow';
import TimedLocalStorage from './TimedLocalStorage';

const API_TIMEOUT = 25000; // ms
const SHOPINFO_CACHE_DURATION = 1000 * 60 * 10; // 10 min in ms

// eslint-disable-next-line no-unused-vars
const util = {
    sign: (web3: Object, toSign: any, account: string): function => {
        const sign = web3.eth.personal.sign;
        // Thinking WTF? Well, the easiest way to make dapper work was
        // by using the "MetamaskSubprovider" which maps eth.sign to
        // eth.personal.sign. But 0x's subproviders somehow don't handle
        return sign(toSign, account);
    },

    randomFailurePromise: (): any => {
        const skipTest = Math.round(Math.random());
        if (skipTest === 1) {
            console.log('running skip test');
            return Promises.makeCancelable(
                new Promise((resolve: any, reject: any) => {
                    setTimeout(
                        function () {
                            reject(new Error('FUCK'));
                        }.bind(this),
                        2000
                    );
                })
            );
        }
        return null;
    },

    failPromise: (message: string): void =>
        Promises.makeCancelable(
            new Promise((resolve: Promise, reject: Promise) => {
                reject(new Error(message));
            })
        ),

    encodeProtobufToFormData: (proto: any): string => {
        const bin = proto.serializeBinary();
        const hex = Web3.utils.bytesToHex(bin);
        return hex.slice(2);
    },

    protobufForm: (sourceAccount: string, protoData: any): FormData => {
        const data = new FormData();
        data.append('sourceaccount', sourceAccount);
        const bin = protoData.serializeBinary();
        const hex = Web3.utils.bytesToHex(bin);
        const message = hex.slice(2);
        data.append('protobuf', message);
        return data;
    },

    //  Handles all the complexity of api calls. preResolveFunc allows you to
    //  process the data before resolving the promise. The opt_cache functions
    //  allow you to implement cache read and write. opt_cacheReadFn returns
    //  the post-preResolveFunc object (won't be transformed). opt_cacheWriteFn
    //  receives a post-preResolveFunc object
    api: (url, form, preResolveFunc, opt_cacheReadFn, opt_cacheWriteFn) => {
        const resultPromise = new Promise((resolve: any, reject: any) => {
            const timeoutID = setTimeout(
                function () {
                    console.log('[' + url + '] Timeout', form);
                    reject(new Error('Timeout'));
                }.bind(this),
                API_TIMEOUT
            );

            if (opt_cacheReadFn != null) {
                const cacheRes = opt_cacheReadFn();
                console.log('[' + url + '] Cache read:', cacheRes);
                if (cacheRes != null) resolve(cacheRes);
            }

            fetch(url, {
                method: 'POST',
                body: form,
            })
                .then((res) => {
                    clearTimeout(timeoutID);

                    if (!res.ok) {
                        // return a nice error message something went wrong
                        res.text().then((text) => {
                            reject(text);
                        });
                    } else {
                        res.arrayBuffer()
                            .then((buf) => {
                                let reply = buf;
                                if (preResolveFunc) {
                                    reply = preResolveFunc(buf);
                                }

                                if (opt_cacheWriteFn != null) {
                                    opt_cacheWriteFn(reply);
                                    console.log(
                                        '[' + url + '] Cache write:',
                                        reply
                                    );
                                }

                                console.log('[' + url + '] Success', reply);
                                resolve(reply);
                            })
                            .catch((err) => {
                                reject(
                                    new Error(
                                        '[' +
                                            url +
                                            '] Error decoding reply:' +
                                            err
                                    )
                                );
                            });
                    }
                })
                .catch((err) => {
                    reject(
                        new Error('[' + url + '] Error sending POST:' + err)
                    );
                });
        });

        return Promises.makeCancelable(resultPromise);
    },
};

const shop = {
    add: (
        web3: Object,
        account: string,
        shopInfo: ShopInfo$AsClass
    ): Promise<any> => {
        const resultPromise = new Promise((resolve: any, reject: any) => {
            console.log(shopInfo);
            const shopInfoBin = shopInfo.serializeBinary();
            const shopInfoHex = web3.utils.bytesToHex(shopInfoBin);
            // Removing the 0x helps sign the binary data w/o conversion
            const toSign = 'Shop Info: ' + shopInfoHex.slice(2);
            console.log(
                '========================================================'
            );
            util.sign(web3, toSign, account)
                .then((sig: string) => {
                    // Start POST Write Message
                    const data = new FormData();
                    data.append('sourceaccount', account);
                    data.append('message', toSign);
                    data.append('signature', sig);
                    console.log('[/shopinfo/add] preparing data for server:', {
                        account,
                        toSign,
                        sig,
                    });

                    // Test Verify
                    // web3.eth.personal.ecRecover(toSign, sig).then(
                    //     console.log.bind(console.log, "Recover:"));

                    const timeoutID = setTimeout(
                        function () {
                            console.log('[/shopinfo/add] Timeout:', account);
                            reject(new Error('Timeout'));
                        }.bind(this),
                        API_TIMEOUT
                    );
                    fetch('/shopinfo/add', {
                        method: 'POST',
                        body: data,
                    })
                        .then((res: any): void | string => {
                            console.log(
                                `[/shopinfo/add RESPONSE] STAT: ${res.status} | OK: ${res.ok}`
                            );
                            clearTimeout(timeoutID);
                            if (res.ok) return res.text();
                            res.text().then((text: string) => {
                                reject(text);
                            });
                            return null;
                        })
                        .catch((err: Error) => {
                            console.log(
                                '[/shopinfo/add] Error sending POST',
                                err
                            );
                            reject(new Error('POSTing error'));
                        })
                        .then((res: any) => {
                            if (res === null) {
                                console.log('bailing');
                                return;
                            }
                            resolve();
                        });
                })
                .catch((err: Error) => {
                    console.log('Error signing', err);
                    reject(new Error('Signing Failed'));
                });
        });

        return Promises.makeCancelable(resultPromise);
    },

    getAllShops: (account: string): Promise<any> => {
        const resultPromise = new Promise((resolve: any, reject: any) => {
            var data = new FormData();
            data.append('sourceaccount', account);

            const timeoutID = setTimeout(
                function () {
                    console.log('[/shopinfo/getallshops] Timeout:', account);
                    reject(new Error('Timeout'));
                }.bind(this),
                API_TIMEOUT
            );

            fetch('/shopinfo/getallshops', {
                method: 'POST',
                body: data,
            })
                .then((res: any): any => {
                    console.log(
                        `[/shopinfo/getallshops RESPONSE] STAT: ${res.status} | OK: ${res.ok}`
                    );
                    clearTimeout(timeoutID);
                    if (res.ok) return res.arrayBuffer();

                    res.text().then((text: string) => {
                        reject(text);
                    });
                    return null;
                })
                .catch((err: Error): void => {
                    console.log(
                        '[/shopinfo/getallshops] Error sending POST',
                        err
                    );
                    reject(err);
                    return undefined;
                })
                .then((resData: any) => {
                    if (resData == null) {
                        reject(new Error('404'));
                        return;
                    }
                    try {
                        console.log('>>>>>>>>>>>rawdata', { resData });
                        const shopInfo = ShopInfos.deserializeBinary(resData);
                        const shopInfoArray = shopInfo.toObject();
                        console.log(
                            '[/shopinfo/getallshops] Success',
                            shopInfoArray
                        );
                        resolve(shopInfoArray.itemsList);
                    } catch (err) {
                        console.log('[User Read ERR] unable to handle', err);
                        reject(err);
                    }
                });
        });

        return Promises.makeCancelable(resultPromise);
    },

    delete: (
        web3: Object,
        account: string,
        shopInfo: ShopInfo$AsClass
    ): Promise<any> => {
        const resultPromise = new Promise((resolve: any, reject: any) => {
            console.log(shopInfo);
            const shopInfoBin = shopInfo.serializeBinary();
            const shopInfoHex = web3.utils.bytesToHex(shopInfoBin);
            // Removing the 0x helps sign the binary data w/o conversion
            const toSign = 'Shop Info: ' + shopInfoHex.slice(2);
            console.log(
                '========================================================'
            );
            util.sign(web3, toSign, account)
                .then((sig: string) => {
                    // Start POST Write Message
                    const data = new FormData();
                    data.append('sourceaccount', account);
                    data.append('message', toSign);
                    data.append('signature', sig);
                    console.log(
                        '[/shopinfo/delete] preparing data for server:',
                        {
                            account,
                            toSign,
                            sig,
                        }
                    );

                    // Test Verify
                    // web3.eth.personal.ecRecover(toSign, sig).then(
                    //     console.log.bind(console.log, "Recover:"));

                    const timeoutID = setTimeout(
                        function () {
                            console.log('[/shopinfo/delete] Timeout:', account);
                            reject(new Error('Timeout'));
                        }.bind(this),
                        API_TIMEOUT
                    );
                    fetch('/shopinfo/delete', {
                        method: 'POST',
                        body: data,
                    })
                        .then((res: any): void | string => {
                            console.log(
                                `[/shopinfo/delete RESPONSE] STAT: ${res.status} | OK: ${res.ok}`
                            );
                            clearTimeout(timeoutID);
                            if (res.ok) return res.text();
                            res.text().then((text: string) => {
                                reject(text);
                            });
                            return null;
                        })
                        .catch((err: Error) => {
                            console.log(
                                '[/shopinfo/delete] Error sending POST',
                                err
                            );
                            reject(new Error('POSTing error'));
                        })
                        .then((res: any) => {
                            if (res === null) {
                                console.log('bailing');
                                return;
                            }
                            resolve();
                        });
                })
                .catch((err: Error) => {
                    console.log('Error signing', err);
                    reject(new Error('Signing Failed'));
                });
        });

        return Promises.makeCancelable(resultPromise);
    },
};

const session = {
    login: (web3: Object, account: string): Promise<any> =>
        new Promise((resolve: any, reject: any) => {
            const toSign = 'Virtual Mall Login';

            util.sign(web3, toSign, account)
                .then((sig) => {
                    console.log('[/session/login] Signature:', sig);

                    // Start POST Write Message
                    var data = new FormData();
                    data.append('sourceaccount', account);
                    data.append('message', toSign);
                    data.append('signature', sig);

                    const timeoutID = setTimeout(
                        function () {
                            console.log('[/session/login] Timeout:', account);
                            reject(new Error('Timeout'));
                        }.bind(this),
                        API_TIMEOUT
                    );

                    fetch('/session/login', {
                        method: 'POST',
                        body: data,
                    })
                        .then((res) => {
                            console.log(
                                `[/session/login RESPONSE] STAT: ${res.status} | OK: ${res.ok}`
                            );
                            clearTimeout(timeoutID);
                            if (res.ok) return res.text();
                            reject(new Error('Login failed'));
                            return null;
                        })
                        .catch((err) => {
                            console.log(
                                '[/session/login] Error sending POST',
                                err
                            );
                            reject(new Error('POSTing error'));
                        })
                        .then((res) => {
                            if (res === null) {
                                return;
                            }
                            resolve(res);
                            console.log('SessionLogin Complete!');
                        });
                })
                .catch((err) => {
                    console.log('Error signing', err);
                    reject(new Error('Signing Failed'));
                });
        }),
};

const PostAPI = {
    shop,
    session,
    util,
};

export default PostAPI;
