import * as React from 'react';
import { Step } from '../../model/step';
import IngredientComponent from '../ingredient/ingredient';
import { Ingredient, Grain, Hop, Water, Aroma, Yeast } from '../../model/ingredient';
import './step.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { database } from '../../model/database';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import fermentable from '../../assets/icons/fermentable.png';
import hop from '../../assets/icons/hop.png';
import aroma from '../../assets/icons/aroma.png';
import yeast from '../../assets/icons/yeast.png';
import misc from '../../assets/icons/misc.png';
import water from '../../assets/icons/water.png';
import { Unit } from '../../service/unit';
import { Color } from '../../service/color';

interface Selection {
    key: string;
    text: any;
    value: string;
    image?: { avatar: boolean, src: string };
}

interface Props {
    step: Step;
    onChange: (step: Step) => void;
}

interface State {
    newType: string;
    newIngredient: string;
}

export default class StepComponent extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);

    }

    handleIngredientChange = (oldIngredient: Ingredient) => {
        return (newIngredient: Ingredient) => {
            const ingredients = this.props.step.ingredients.map((i: Ingredient) => i === oldIngredient ? newIngredient : i);
            this.props.onChange(Step.fromApi({ ...this.props.step, ingredients }));
        };
    }

    handleRemove = (ingredient: Ingredient) => {
        return (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            const ingredients = this.props.step.ingredients.filter((i: Ingredient) => i !== ingredient);
            this.props.onChange(Step.fromApi({ ...this.props.step, ingredients }));
            event.stopPropagation();
        };
    }

    handleIngredientTypeChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        if (data.value === 'water') {
            this.props.onChange(
                Step.fromApi({
                    ...this.props.step,
                    ingredients: [
                        ...this.props.step.ingredients,
                        Water.fromApi({
                            name: "eau",
                            qty: {
                                value: 0,
                                unit: {
                                    type: 'volume.l',
                                },
                            },
                        }),
                    ],
                }),
            );
            this.setState({ newType: '' });
            return;
        }
        this.setState({ newType: `${data.value}` });
        console.log(data.value);
    }

    handleIngredientSelect = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const ingredient = database[this.state.newType][parseInt(`${data.value}`, 10)];
        let ing: Ingredient;
        switch (this.state.newType) {
                case 'fermentable':
                    ing = Grain.fromApi({
                        name: ingredient.name,
                        ebc: ingredient.ebc,
                        yield: ingredient.yield,
                        qty: {
                            value: 0,
                            unit: {
                                type: 'mass.kg',
                            },
                        },
                    });
                    break;
                case 'hop':
                    ing = Hop.fromApi({
                        name: ingredient.name,
                        form: ingredient.form,
                        alpha: ingredient.alpha,
                        qty: {
                            value: 0,
                            unit: {
                                type: 'mass.g',
                            },
                        },
                    });
                    break;
                case 'aroma':
                    ing = Aroma.fromApi({
                        name: ingredient.name,
                        qty: {
                            value: 0,
                            unit: {
                                type: 'mass.g',
                            },
                        },
                    });
                    break;
                case 'yeast':
                    ing = Yeast.fromApi({
                        name: ingredient.name,
                        qty: {
                            value: 0,
                            unit: {
                                type: 'mass.g',
                            },
                        },
                    });
                    break;
                default:
                    ing = Hop.fromApi({
                        name: ingredient.name,
                        qty: {
                            value: 0,
                            unit: {
                                type: 'mass.g',
                            },
                        },
                    });
        }
        this.setState({
            newType: '',
            newIngredient: '',
        });
        this.props.onChange(
            Step.fromApi({
                ...this.props.step,
                ingredients: [
                    ...this.props.step.ingredients,
                    ing,
                ],
            }),
        );
    }

    render(): JSX.Element {
        const step = this.props.step || new Step('');
        const ingredientTypes: Selection[] = Object.keys(database).map((value: string) => {
            let imgSrc = '';
            let caption = '';
            switch (value) {
                    case 'fermentable':
                        imgSrc = fermentable;
                        caption = 'Céréale';
                        break;
                    case 'hop':
                        imgSrc = hop;
                        caption = 'Houblon';
                        break;
                    case 'aroma':
                        imgSrc = aroma;
                        caption = 'Arôme';
                        break;
                    case 'yeast':
                        imgSrc = yeast;
                        caption = 'Levure';
                        break;
                    case 'misc':
                        imgSrc = misc;
                        caption = 'Divers';
                        break;
                    case 'water':
                        imgSrc = water;
                        caption = 'Eau';
                        break;
                    default:
                        imgSrc = misc;
                        caption='Divers';
            }
            return {
                value,
                key: value,
                text: caption,
                image: {
                    avatar: true,
                    src: imgSrc,
                },
            };
        });
        const currentIngredientType: string = this.state.newType || '';
        const currentIngredient = this.state.newIngredient;
        const ingredients: Selection[] = Array.isArray(database[currentIngredientType]) ? database[currentIngredientType]
        .sort((a: any, b: any) => {
            switch (currentIngredientType) {
                    case 'fermentable':
                        if (a.color < b.color) {
                            return -1;
                        }
                        if (a.color > b.color) {
                            return 1;
                        }
                        return 0;
                    case 'hop':
                        if (a.alpha < b.alpha) {
                            return -1;
                        }
                        if (a.alpha > b.alpha) {
                            return 1;
                        }
                        return 0;
                    default:
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
            }
        })
        .map((data: any, index: number) => {
            switch (currentIngredientType) {
                    case 'fermentable':
                        const maltColor: number = Unit.fromTo(data.color, 'color.ebc', 'color.rgb');
                        const hsv = Color.RGB2HSV(maltColor);
                        const textColor: string = (hsv.value > 50 ? '#000' : '#fff');
                        return {
                            key: `${data.name}-${index}`,
                            text: <span>
                                <span className="badge" style={ { backgroundColor: Color.numToHex(maltColor), color: textColor } }>{data.color}</span>
                                <span className="left-space-m8">{data.name}</span>
                            </span>,
                            value: `${index}`,
                        };
                    case 'hop':
                        const hopColor: string = Color.HSV2RGB(143 / 360, data.alpha * 4 / 100, 1);
                        console.log(data.alpha, data.alpha * 4 / 100, hopColor);
                        return {
                            key: `${data.name}-${index}`,
                            text: <span>
                                <span className="badge" style={ { backgroundColor: hopColor, color: '#007f30' } }>{data.alpha} %</span>
                                <span className="left-space-m8">{data.name}</span>
                            </span>,
                            value: `${index}`,
                            image: { avatar: true, src: '' },
                        };
                    case 'aroma':
                        return {
                            key: `${data.name}-${index}`,
                            text: `${data.name}`,
                            value: `${index}`,
                            image: { avatar: true, src: '' },
                        };
                    case 'yeast':
                        return {
                            key: `${data.name}-${index}`,
                            text: `${data.name} (${data.laboratory})`,
                            value: `${index}`,
                            image: { avatar: true, src: '' },
                        };
                    case 'misc':
                        return {
                            key: `${data.name}-${index}`,
                            text: `${data.name}`,
                            value: `${index}`,
                            image: { avatar: true, src: '' },
                        };
                    case 'water':
                        return {
                            key: `${data.name}-${index}`,
                            text: 'Eau',
                            value: `${index}`,
                            image: { avatar: true, src: '' },
                        };
                    default:
                        return {
                            key: `${data.name}-${index}`,
                            text: `${data.name}`,
                            value: `${index}`,
                            image: { avatar: true, src: '' },
                        };
            }
        }) : [];
        return <div className="process-step">
            <ul className="ingredients">
            {step.ingredients.map((ingredient: Ingredient, index: number) => {
                return <li key={index} className="relative row">
                    <IngredientComponent ingredient={ingredient} onChange={this.handleIngredientChange(ingredient)}/>
                    <button type="button" className="btn btn-link ingredient-delete" onClick={this.handleRemove(ingredient)}><FontAwesomeIcon icon={faTrash} /></button>
                </li>;
            })}
            <li className="row">
                <span className="col-md-2">
                    <Dropdown
                        placeholder='Type'
                        fluid
                        value={currentIngredientType}
                        selection
                        onChange={this.handleIngredientTypeChange}
                        options={ingredientTypes}
                    />
                </span>
                {currentIngredientType && <span className="col-md-3">
                    <Dropdown
                        placeholder='Ingrédient'
                        fluid
                        value={currentIngredient}
                        selection
                        onChange={this.handleIngredientSelect}
                        options={ingredients}
                    />
                </span>}

            </li>
            </ul>
        </div>;
    }
}

