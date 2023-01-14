// @flow
import * as React from 'react';
import s from './index.less';
import PropTypes from 'prop-types';
import Go from '../Go';

type Props = {
    backgroundOnly?: boolean,
    backgroundClass?: string,
};

const Footer = (props: Props): React.Node => {
    const footerClasses = [s.footer];
    if (props.backgroundClass) footerClasses.push(props.backgroundClass);
    if (props.backgroundOnly) footerClasses.push(s.backgroundOnly);
    return (
        <div className={footerClasses.join(' ')}>
            <div>Footer</div>
        </div>
    );
};
Footer.propTypes = {
    backgroundOnly: PropTypes.bool,
};

export default Footer;
