import * as React from 'react';
import { Ingredient, Grain } from '../../../model/ingredient';
import './ingredient-aroma.scss';

import { ReactComponent as AromaSvg } from '../../../assets/icons/aroma.svg';
import EditableQuantity from '../../../components/editable/quantity/editable-quantity';
import { Quantity } from '../../../model/quantity';
import EditableText from '../../../components/editable/text/editable-text';

interface Props {
    ingredient: Ingredient;
    onChange: (newIngredient: Ingredient) => void;
}

interface State {

}

export default class IngredientAromaComponent extends React.PureComponent<Props, State> {

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
        return <span className="ingredient-aroma">
            <AromaSvg className="ingredient-icon" height="16" />
            <span className="col-md-4"><EditableText<string> value={ingredient.name} onChange={this.handleNameChange} /></span>
            <span className="col-md-2"><EditableQuantity value={ingredient.qty} onChange={this.handleQuantityChange} /></span>
        </span>;
    }
}