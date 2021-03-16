import * as React from 'react';
import './confirm-button.scss';
import { map as _map, find as _find, get as _get } from 'lodash-es';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Props {
    onAbort?: () => void;
    onAccept?: () => void;
    disabled?: boolean;
    className?: string;
}

interface State {
    displayConfirm: boolean;
}

export class ConfirmButton extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);

    }

    handleConfirm = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        this.setState({ displayConfirm: false }, () => {
            if (this.props.onAccept) {
                this.props.onAccept();
            }
        });
        this.setState({ displayConfirm: false });
    }

    handleAbord = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        this.setState({ displayConfirm: false }, () => {
            if (this.props.onAbort) {
                this.props.onAbort();
            }
        });
    }

    handleOpenConfirm = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        this.setState({ displayConfirm: true });
    }

    render(): JSX.Element {
        const displayConfirm = !!this.state.displayConfirm;
        const disabled = !!this.props.disabled;
        return <span className={this.props.className || ''}>
            {!displayConfirm && <button
                    type="button"
                    disabled={disabled}
                    className="confirm-button"
                    onClick={this.handleOpenConfirm}
                >{this.props.children}</button>}
            {displayConfirm && <span>
                <button
                    type="button"
                    disabled={disabled}
                    className="confirm-button-abord"
                    onClick={this.handleAbord}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    className="confirm-button-accept"
                    onClick={this.handleConfirm}
                >
                    <FontAwesomeIcon icon={faCheck} />
                </button>
            </span>}
        </span>;
    }
}
