// @flow
import * as React from 'react';
import Page from '../../components/Page';
import Footer from '../../components/Footer';
import s from './index.less';

type Props = {
    history: Object,
};

const LandingPage = (props: Props): React.Node => {
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

    return (
        <>
            <Page
                pageClass={s.page}
                contentBackgroundClass={s.background}
                contentPreferredWidth={800}
                contentClass={s.pageContent}>
                <div
                    className={s.text}
                    style={{
                        height: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <div>Biz Page!</div>
                </div>
            </Page>
        </>
    );
};
export default LandingPage;
