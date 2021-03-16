import * as React from 'react';
import { Ingredient, Grain, Yeast, Hop, Aroma, Water } from '../../model/ingredient';
import './ingredient.scss';

import { ReactComponent as WaterSvg } from '../../assets/icons/water.svg';
import { ReactComponent as MiscSvg } from '../../assets/icons/misc.svg';
import { ReactComponent as AromaSvg } from '../../assets/icons/aroma.svg';
import { ReactComponent as FermentableSvg } from '../../assets/icons/fermentable.svg';
import { ReactComponent as YeastSvg } from '../../assets/icons/yeast.svg';
import { ReactComponent as HopSvg } from '../../assets/icons/hop.svg';
import { Quantity } from '../../model/quantity';
import IngredientWaterComponent from './water/ingredient-water';
import IngredientAromaComponent from './aroma/ingredient-aroma';
import IngredientFermentableComponent from './fermentable/ingredient-fermentable';
import IngredientYeastComponent from './yeast/ingredient-yeast';
import IngredientHopComponent from './hop/ingredient-hop';
import IngredientMiscComponent from './misc/ingredient-misc';

interface Props {
    ingredient: Ingredient;
    onChange: (newIngredient: Ingredient) => void;
}

interface State {

}

export default class IngredientComponent extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);

    }

    handleQuantityChange = (newQuantity: Quantity, oldQuantity: Quantity) => {
        this.props.onChange(Ingredient.fromApi({ ...this.props.ingredient, qty: newQuantity }) as Ingredient);
    }

    renderIcon(param: string): any {
        switch (param.toLowerCase()) {
                case 'water':
                    return <WaterSvg className="ingredient-icon" height="16"/>;
                case 'aroma':
                    return <AromaSvg className="ingredient-icon" height="16" />;
                case 'fermentable':
                    return <FermentableSvg className="ingredient-icon" height="16" />;
                case 'yeast':
                    return <YeastSvg className="ingredient-icon" height="16" />;
                case 'hop':
                    return <HopSvg className="ingredient-icon" height="16" />;
                default:
                    return <MiscSvg className="ingredient-icon" height="16" />;
        }
    }

    renderIngredient(ingredient: Ingredient, onChange: (newIngredient: Ingredient) => void): any {
        switch (ingredient.type.toLowerCase()) {
                case 'water':
                    return <IngredientWaterComponent onChange={onChange} ingredient={ingredient as Water}/>;
                case 'aroma':
                    return <IngredientAromaComponent onChange={onChange} ingredient={ingredient as Aroma}/>;
                case 'fermentable':
                    return <IngredientFermentableComponent onChange={onChange} ingredient={ingredient as Grain}/>;
                case 'yeast':
                    return <IngredientYeastComponent onChange={onChange} ingredient={ingredient as Yeast}/>;
                case 'hop':
                    return <IngredientHopComponent onChange={onChange} ingredient={ingredient as Hop}/>;
                default:
                    return <IngredientMiscComponent onChange={onChange} ingredient={ingredient}/>;
        }
    }

    render(): JSX.Element {
        const ingredient = this.props.ingredient || new Grain('');
        return <span className="ingredient">
            {this.renderIngredient(ingredient, this.props.onChange)}
        </span>;
    }
}
