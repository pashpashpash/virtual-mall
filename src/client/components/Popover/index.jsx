/* eslint-disable flowtype/no-weak-types */
// @flow
import * as React from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import s from './index.less';

type CloseButtonProps = {|
    closeButtonClassName: string,
    onClick: Function,
|};

class CloseButton extends React.Component {
    constructor(props: CloseButtonProps) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyPress);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress(e: SyntheticEvent) {
        if (e.key.toLowerCase() === 'escape') this.props.onClick();
    }

    render(): React.Node {
        const customClass = this.props.closeButtonClassName || '';
        const classes = [s.closePadding, customClass].join(' ');

        return (
            <div className={classes}>
                <div className={s.closeButton} onClick={this.props.onClick} />
            </div>
        );
    }
}

CloseButton.propTypes = {
    closeButtonClass: PropTypes.string,
    onClick: PropTypes.func,
};

type PopoverProps = {|
    startVisible: boolean,
    onHide: Function,
    className: string,
    closeButtonClass: string,
    noChildPadding: boolean,
    header: string,
|};

class Popover extends React.Component {
    constructor(props: PopoverProps) {
        super(props);

        this.state = {
            visible: false,
        };

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    componentDidMount() {
        const startVisible = this.props.startVisible || false;
        if (startVisible) this.show();
    }

    show() {
        this.setState({ visible: true });
    }

    hide() {
        this.setState({ visible: false });
        if (this.props.onHide) this.props.onHide();
    }

    render(): React.Node {
        // NOTE:athorp:2018-04-27 there's a very annoying bug with 3D transforms
        // plus position: fixed elements. Basically, the 3D effect moves them.
        // Thus, we use <Portal> to move the element to document.body
        const visible = this.state.visible === true ? ' ' + s.visible : '';
        const classes = ' ' + (this.props.className || '');
        const childClasses = [s.children];
        if (this.props.childClass) childClasses.push(this.props.childClass);

        return (
            <Portal>
                <div
                    className={s.popoverBackground + visible}
                    onClick={this.hide}
                    style={{ opacity: visible ? 1 : 0 }}>
                    <div className={s.border}>
                        <div
                            className={s.popover + classes}
                            onClick={(e: SyntheticEvent): void =>
                                e.stopPropagation()
                            }>
                            <div className={s.headerBone}>
                                <p>{this.props.header}</p>
                            </div>
                            <CloseButton
                                onClick={this.hide}
                                closeButtonClass={this.props.closeButtonClass}
                            />
                            <div
                                className={
                                    !this.props.noChildPadding && s.children
                                }>
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        );
    }
}

Popover.propTypes = {
    startVisible: PropTypes.bool,
    className: PropTypes.string,
    closeButtonClass: PropTypes.string,
    noChildPadding: PropTypes.bool,
    onHide: PropTypes.func,
};

export default Popover;
