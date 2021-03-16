import './editable-text.scss';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props<T> {
    value: T;
    onChange: (newValue: T, oldValue: T) => void;
    template?: (value: T) => any;
}

interface State<T> {
    tempValue: T;
    editing: boolean;
}

export default class EditableText<T> extends React.PureComponent<Props<T>, State<T>> {

    constructor(props: Props<T>, public state: State<T>) {
        super(props, state);
    }

    reformat(st: string): T {
        let tempValue: T;
        switch (typeof(st)) {
                case 'number':
                    tempValue = parseInt(st, 10) as any || 0;
                    break;
                case 'string':
                    tempValue = st as any;
                    break;
                default:
                    tempValue = st as any;
        }
        return tempValue;
    }

    handleEdit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        this.setState({ editing: true, tempValue: this.props.value });
        event.stopPropagation();
    }

    handleCancel = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        this.setState({
            tempValue: this.props.value,
            editing: false,
        });
        if (event) {
            event.stopPropagation();
        }
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ tempValue: this.reformat(event.currentTarget.value) });
    }

    handleValidate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const oldValue = this.props.value;
        let tempValue: T = this.state.tempValue;
        this.setState({
            editing: false,
        });
        this.props.onChange(tempValue, oldValue);
        if (event) {
            event.stopPropagation();
        }
    }

    handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 27) {
            this.handleCancel();
        }
        event.stopPropagation();
    }

    render(): JSX.Element {
        let value: string = this.state.editing ? `${this.state.tempValue}` : `${this.props.value}`;
        if (this.props.template) {
            value = this.props.template(this.state.editing ? this.state.tempValue : this.props.value);
        }
        const tempValue: T = this.state.tempValue;
        return <div className="editable-text">
            {!this.state.editing && <span>
                <span>{value}</span>
                <button type="button" className="btn btn-sm btn-link" onClick={this.handleEdit}>
                    <FontAwesomeIcon icon={faPen} />
                </button>
            </span>}
            {this.state.editing && <form onSubmit={this.handleValidate}>
                <input
                    type="text"
                    value={`${tempValue}`}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKey}
                    onClick={ (event) => event.stopPropagation() }
                    className="form-control" />
                <button type="submit" className="btn btn-sm btn-link" >
                    <FontAwesomeIcon icon={faCheck} />
                </button>
                <button type="button" className="btn btn-sm btn-link" onClick={this.handleCancel}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </form>}
        </div>;
    }
}
