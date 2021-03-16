import * as React from 'react';
import './toggle.scss';
import {
    get as _get,
    isBoolean as _isBoolean,
    uniqueId as _uniqueId,
} from 'lodash-es';

interface Props {
    value: boolean;
    onChange?: (state: boolean) => void;
    disabled?: boolean;
}

interface State {
    value: boolean;
    disabled: boolean;
}

export default class Toggle extends React.PureComponent<Props, State> {

    private id: string = _uniqueId('toggle_');

    constructor(props: Props, public state: State) {
        super(props, state);
        this.state = {
            value: false,
            disabled: false,
        };
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value: boolean = !!(target.type === 'checkbox' ? target.checked : (target.value === 'true'));
        this.setState({ value });
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    componentWillReceiveProps(nextProps: Props): void {
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
        if (_isBoolean(nextProps.disabled)) {
            this.setState({ disabled: nextProps.disabled });
        }
    }

    render(): JSX.Element {
        const disabled: boolean = _get(this.state, 'disabled', false);
        return <label className="checkbox" htmlFor={this.id}>
            <input className="field"
                id={this.id}
                name={this.id}
                type="checkbox"
                checked={this.state.value}
                disabled={disabled}
                onChange={this.onChange}/>
            <span className="toggle"></span>
        </label>;
    }
}
