import * as React from 'react';
import { Ingredient, Grain, Hop } from '../../../model/ingredient';
import './ingredient-hop.scss';

import { ReactComponent as HopSvg } from '../../../assets/icons/hop.svg';
import EditableQuantity from '../../editable/quantity/editable-quantity';
import { Quantity } from '../../../model/quantity';
import EditableText from '../../editable/text/editable-text';
import { Color } from '../../../service/color';

interface Props {
    ingredient: Hop;
    onChange: (newIngredient: Ingredient) => void;
}

interface State {

}

export default class IngredientHopComponent extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);

    }

    handleAlphaChange = (alpha: number, oldQuantity: number) => {
        this.props.onChange(Hop.fromApi({
            ...this.props.ingredient,
            alpha,
        }));
    }

    displayAlpha = (v: number) => {
        const hopColor: string = Color.HSV2RGB(143 / 360, v * 4 / 100, 1);
        return <span className="badge" style={ { backgroundColor: hopColor, color: '#007f30' } }>{v} %</span>;
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
        return <span className="ingredient-hop">
            <HopSvg className="ingredient-icon" height="16" />
            <span className="col-md-2"><EditableText<string> value={ingredient.name} onChange={this.handleNameChange} /></span>
            <span className="col-md-2 screenable"><EditableText<number> value={ingredient.alpha} onChange={this.handleAlphaChange} template={this.displayAlpha}/></span>
            <span className="col-md-2"><EditableQuantity value={ingredient.qty} onChange={this.handleQuantityChange} /></span>
        </span>;
    }
}