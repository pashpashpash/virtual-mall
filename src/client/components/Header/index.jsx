// @flow
import * as React from 'react';
import s from './index.less';

import Go from '../Go';
import URL from 'url-parse';
import AccountNav from '../AccountNav';

// import Beta from './beta';

const Header = (): React.Node => {
    const curHost = window.location.hostname;
    let thisSite = curHost;

    if (curHost === 'localhost') {
        thisSite = 'http://localhost:8100';
    }

    const ReedemableLinks = [
        {
            to: thisSite + '/',
            text: 'Home',
        },
        {
            to: thisSite + '/admin',
            text: 'Admin',
        },
        {
            to: thisSite + '/biz',
            text: 'Biz',
        },
    ];

    const links = ReedemableLinks.map(
        (linkData: { to: string, text: string }, i: number): React.Node => (
            <Go
                to={linkData.to}
                key={i}
                className={s.menuButton}
                data-category={'Mall-header'}
                data-action={linkData.text}>
                {linkData.text}
            </Go>
        )
    );

    return (
        <div className={s.header}>
            <div className={s.socialButtons}></div>
            <div className={s.mainLinks}>{links}</div>
            <div className={s.connectWallet}>
                <AccountNav />
            </div>
        </div>
    );
};

export default Header;
