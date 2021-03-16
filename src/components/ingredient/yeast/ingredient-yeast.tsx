import * as React from 'react';
import { Ingredient, Grain, Yeast } from '../../../model/ingredient';
import './ingredient-yeast.scss';

import { ReactComponent as YeastSvg } from '../../../assets/icons/yeast.svg';
import EditableQuantity from '../../../components/editable/quantity/editable-quantity';
import { Quantity } from '../../../model/quantity';

interface Props {
    ingredient: Yeast;
    onChange: (newIngredient: Ingredient) => void;
}

interface State {

}

export default class IngredientYeastComponent extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);

    }

    handleQuantityChange = (newQuantity: Quantity, oldQuantity: Quantity) => {
        this.props.onChange(Ingredient.fromApi({ ...this.props.ingredient, qty: newQuantity }) as Ingredient);
    }

    handleNameChange = (name: string) => {
        this.props.onChange(Grain.fromApi({
            ...this.props.ingredient,
            name,
        }));
    }

    render(): JSX.Element {
        const ingredient = this.props.ingredient || new Grain('');
        return <span className="ingredient-yeast">
            <YeastSvg className="ingredient-icon" height="16" />
            <span className="col-md-4">{ingredient.name}</span>
            <span className="col-md-2"><EditableQuantity value={ingredient.qty} onChange={this.handleQuantityChange} /></span>
        </span>;
    }
}