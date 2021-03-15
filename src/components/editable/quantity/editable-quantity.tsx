import './editable-quantity.scss';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Unit } from '../../../service/unit';
import { Quantity } from '../../../model/quantity';

interface Props {
    value: Quantity;
    onChange: (newQuantity: Quantity, oldQuantity: Quantity) => void;
}

interface State {
    tempValue: Quantity;
    editing: boolean;
}

export class EditableQuantity extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);
    }

    handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 27) {
            this.handleCancel();
        }
        event.stopPropagation();
    }

    handleEdit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        this.setState({ editing: true, tempValue: this.props.value });
        event.stopPropagation();
    }

    handleCancel = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (this.state.editing) {
            this.setState({
                tempValue: this.props.value,
                editing: false,
            });
        }
        if (event) {
            event.stopPropagation();
        }
    }

    handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value: number = parseInt(event.currentTarget.value, 10) || 0;
        this.setState({ tempValue: Quantity.fromApi({ ...this.state.tempValue, value }) });
    }

    handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const units = Unit.getPhysicalUnits(this.state.tempValue.unit.family).filter((unit: Unit) => unit.name === event.target.value);
        if (units.length) {
            const qty: Quantity = Quantity.fromApi({ ...this.state.tempValue, unit: units[0] });
            qty.value = this.state.tempValue.convertTo(units[0].type);
            this.setState({ tempValue: qty });
        }
    }

    handleValidate = (event: React.FormEvent<HTMLFormElement>) => {
        const oldValue = this.props.value;
        this.setState({
            editing: false,
        });
        this.props.onChange(this.state.tempValue, oldValue);
        event.stopPropagation();
        event.preventDefault();
    }

    render(): JSX.Element {
        const value: Quantity = (this.state.editing ? this.state.tempValue : this.props.value) || new Quantity(0, new Unit());
        const tempValue: Quantity = this.state.tempValue || new Quantity(0, new Unit());
        const units: Unit[] = Unit.getPhysicalUnits(value.unit.family);
        return <div className="editable-quantity">
            {!this.state.editing && <span>
                <span>{value.value}</span>
                <span>{value.unit.name}</span>
                <button type="button" className="btn btn-sm btn-link" onClick={this.handleEdit}>
                    <FontAwesomeIcon icon={faPen} />
                </button>
            </span>}
            {this.state.editing && <form onSubmit={this.handleValidate}>
                <input
                    type="text"
                    value={`${tempValue.value}`}
                    onChange={this.handleValueChange}
                    onKeyDown={this.handleKey}
                    onClick={ (event) => event.stopPropagation() }
                    className="form-control" />
                <select className="form-control" value={tempValue.unit.name} onChange={this.handleUnitChange}>
                    {units.map((unit: Unit) => {
                        return <option key={unit.name}>{unit.name}</option>;
                    })}
                </select>
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
