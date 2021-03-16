import * as React from 'react';
import { Ingredient, Grain } from '../../../model/ingredient';
import './ingredient-fermentable.scss';

import { ReactComponent as FermentableSvg } from '../../../assets/icons/fermentable.svg';
import EditableQuantity from '../../../components/editable/quantity/editable-quantity';
import { Quantity } from '../../../model/quantity';
import EditableText from '../../../components/editable/text/editable-text';
import { Unit } from '../../../service/unit';
import { Color } from '../../../service/color';

interface Props {
    ingredient: Grain;
    onChange: (newIngredient: Ingredient) => void;
}

interface State {

}

export default class IngredientFermentableComponent extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);

    }

    handleQuantityChange = (newQuantity: Quantity, oldQuantity: Quantity) => {
        this.props.onChange(Ingredient.fromApi({ ...this.props.ingredient, qty: newQuantity }) as Ingredient);
    }

    handleEbcChange = (ebc: number, oldQuantity: number) => {
        this.props.onChange(Grain.fromApi({
            ...this.props.ingredient,
            ebc,
        }));
    }

    handleNameChange = (name: string) => {
        this.props.onChange(Grain.fromApi({
            ...this.props.ingredient,
            name,
        }));
    }

    displayEbc = (v: number) => {
        const maltColor: number = Unit.fromTo(v, 'color.ebc', 'color.rgb');
        const hsv = Color.RGB2HSV(maltColor);
        const textColor: string = (hsv.value > 50 ? '#000' : '#fff');
        return <span className="badge" style={ { backgroundColor: Color.numToHex(maltColor), color: textColor } }>{v}</span>;
    }

    render(): JSX.Element {
        const ingredient = this.props.ingredient || new Grain('');
        return <span className="ingredient-fermentable">
            <FermentableSvg className="ingredient-icon" height="16" />
            <span className="col-md-2"><EditableText<string> value={ingredient.name} onChange={this.handleNameChange} /></span>
            <span className="col-md-2"><EditableText<number> value={ingredient.ebc} onChange={this.handleEbcChange} template={this.displayEbc}/></span>
            <span className="col-md-2"><EditableQuantity value={ingredient.qty} onChange={this.handleQuantityChange} /></span>
        </span>;
    }
}