import * as React from 'react'
import { Receipe } from '../../model/receipe';
import Data from '../../service/data';
import {v4 as uuidv4} from 'uuid';
import './receipe.scss';
import EditableText from '../editable/text/editable-text';
import EditableQuantity from '../editable/quantity/editable-quantity';
import { Quantity } from '../../model/quantity';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import { Color } from '../../service/color';
import { Step } from '../../model/step';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faExclamationTriangle, faClock, faBars } from '@fortawesome/free-solid-svg-icons';
import { SemanticDatepickerProps } from 'react-semantic-ui-datepickers/dist/types';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import { Accordion, Icon } from 'semantic-ui-react';
import { ConfirmButton } from '../confirmbutton/confirm-button';
import StepComponent from '../step/step';
import { ReactComponent as WaterSvg } from '../../assets/icons/water.svg';
import { Unit } from '../../service/unit';


interface ReceipeProps {
};


interface ReceipeState {
    receipe: Receipe;
    activeSteps: boolean[];
    toDrag: number | undefined;
    targetQty: Quantity;
};

export default class ReceipeComponent extends React.Component<ReceipeProps, ReceipeState> {
    public uuid: string = "";

    private dragStep: Step | undefined;
    private draggingSteps: Step[] = [];

    constructor(props: ReceipeProps) {
        super(props);

        this.state = {
            receipe: new Receipe('', new Date(), ''),
            activeSteps:[],
            toDrag: undefined,
            targetQty: new Quantity(0, new Unit('volume', 'l'))
        }

        Data.dataReady().subscribe({
            next: () => {
                this.getReceipe();
            }
        });
    }

    validate(receipe: Receipe) {
        Data.setData(receipe);
        this.setState({ receipe });
    }

    handleTitleChange = (name: string) => {
        this.validate(Receipe.fromApi({ ...this.state.receipe, name }));
    }

    getReceipe() {
        this.uuid = uuidv4();
        const api = new Data();
        api.getData().subscribe({
            next: (receipe: Receipe) => {
                this.validate(receipe)
            }
        });
    }

    componentDidMount(): void {
        this.getReceipe();
    }

    onDateChange = (event: React.SyntheticEvent<Element, Event> | undefined, data: SemanticDatepickerProps) => {
        const date = data.value;
        if (date) {
            if (Array.isArray(date) && date.length > 1 && !isNaN(date[0].getTime())) {
                this.validate(
                    Receipe.fromApi({
                        ...this.state.receipe,
                        date: date[0],
                    }),
                );
            } else if (!isNaN((date as Date).getTime())) {
                this.validate( Receipe.fromApi({
                        ...this.state.receipe,
                        date,
                    }),
                );
            } else {
                this.validate( Receipe.fromApi({
                        ...this.state.receipe,
                        date: new Date(),
                    }),
                );
            }
        }
    }

    handleClick = (index: number) => {
        const activeSteps = [...this.state.activeSteps];
        return () => {
            activeSteps[index] = !activeSteps[index];
            this.setState({ activeSteps });
        };
    }

    handleStepRemove = (step: Step) => {
        return () => {
            const index = this.state.receipe.steps.indexOf(step);
            const activeSteps = [ ...this.state.activeSteps];
            activeSteps.splice(index, 1);
            this.setState({
                activeSteps,
            }, () => {
                const steps = this.state.receipe.steps.filter((s: Step) => s !== step);
                console.log(steps);
                this.validate( Receipe.fromApi({
                        ...this.state.receipe,
                        steps,
                    }),
                );
            });
        };
    }

    handleStepChange = (step: Step) => {
        return (newStep: Step) => {
            this.validate( Receipe.fromApi({
                    ...this.state.receipe,
                    steps: this.state.receipe.steps.map((s: Step) => s === step ? newStep : s),
                }),
            );
        };
    }

    handleStepNameChange = (step: Step) => {
        return (name: string) => {
            const receipe = this.state.receipe;
            receipe.steps = receipe.steps.map<Step>((stp: Step) => {
                return stp.uuid === step.uuid ? Step.fromApi({ ...step, name }) : stp;
            });
            this.validate(
                Receipe.fromApi(receipe),
            );
        };
    }

    handleStepTemperatureChange = (step: Step) => {
        return (temperature: number) => {
            const receipe = this.state.receipe;
            receipe.steps = receipe.steps.map<Step>((stp: Step) => {
                return stp.uuid === step.uuid ? Step.fromApi({ ...step, temperature }) : stp;
            });
            this.validate(
                Receipe.fromApi(receipe),
            );
        };
    }

    handleStepLastingChange = (step: Step) => {
        return (lasting: number) => {
            const receipe = this.state.receipe;
            receipe.steps = receipe.steps.map<Step>((stp: Step) => {
                return stp.uuid === step.uuid ? Step.fromApi({ ...step, lasting }) : stp;
            });
            this.validate(
                Receipe.fromApi(receipe),
            );
        };
    }

    handleStepAdd = () => {
        this.validate( Receipe.fromApi({
                ...this.state.receipe,
                steps: [ ...this.state.receipe.steps, new Step('Nouvelle ??tape') ],
            }),
        );
    }

    handleMouseDownHdl = (index: number) => {
        return (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
            this.setState({ toDrag: index });
        };
    }

    handleVolTargetChange = (newQuantity: Quantity, oldQuantity: Quantity) => {
        this.setState({targetQty: newQuantity});
    }

    handleScale = () => {
        const currentReceipe = this.state.receipe;
        currentReceipe.scaleToFinalVolume(this.state.targetQty);
        this.setState({
            targetQty: new Quantity(0, new Unit('volume', 'l')),
            receipe: Receipe.fromApi(currentReceipe),
        });
    }

    onDragStart = (index: number) => {
        return (event: React.DragEvent<HTMLDivElement>) => {
            const receipe: Receipe = this.state.receipe || new Receipe('', new Date(), '');
            this.dragStep = receipe.steps[index];
            event.dataTransfer.effectAllowed = 'move';
            this.draggingSteps = receipe.steps.filter((step: Step) => step !== this.dragStep);
            const steps = [...this.draggingSteps];
            steps.splice(index, 0, this.dragStep);

            this.validate( Receipe.fromApi({
                    ...this.state.receipe,
                    steps,
                }),
            );
        };
    }

    onDragOver = (index: number) => {
        return (event: React.DragEvent<HTMLDivElement>) => {
            if (this.dragStep) {
                const steps = [...this.draggingSteps];
                steps.splice(index, 0, this.dragStep);

                this.validate(
                    Receipe.fromApi({
                        ...this.state.receipe,
                        steps,
                    }),
                );
            }
        };
    }

    onDragEnd = () => {
        this.setState({ toDrag: undefined });
        this.dragStep = undefined;
        this.validate(
            Receipe.fromApi(this.state.receipe),
        );
    }
    
    render() : any {
        const leading = (x: number, size=2) => {
            let num = x.toString();
            while (num.length < size) num = "0" + num;
            return num;
        };
        const receipe: Receipe = this.state.receipe || new Receipe('', new Date(), '');
        const activeSteps: boolean[] = this.state.activeSteps || [];
        const beerColor: Color = receipe.color();
        const textColor: string = (beerColor.hsv.saturation > 50 ? '#000' : '#fff');
        const needRincing: boolean = (receipe.advicedRincingVolume().value > 0);
        const toDrag = this.state.toDrag;
        const dragStepUuid = this.dragStep ? this.dragStep.uuid : '';
        const targetQty = this.state.targetQty || new Quantity(0, new Unit('volume', 'l'));
        return <div className="receipe">
        <h2 className="text-center">
            <EditableText<string> value={receipe.name} onChange={this.handleTitleChange}/>
        </h2>
        <div className="printable text-center">- {receipe.date.toLocaleDateString()} -</div>
        <header>
                <div className="head-block">
                    <div className="bottom-space-m16 screenable">
                        <label className="right-space-m16 screenable">Date</label>
                        <SemanticDatepicker
                            onChange={this.onDateChange}
                            pointing="left"
                            type="basic"
                            locale="fr-FR"
                            value={receipe.date}/>
                    </div>
                    <ul className="features">
                        <li className="important">
                            <span className="water libelized">Volume final</span>
                            <span >{ receipe.finalVolume().convertTo('volume.l').toFixed(1) }</span>
                            <span className="unit">L</span>
                            <span className="scale-receipe row">
                                <span className="ingredient-water">
                                    <WaterSvg className="ingredient-icon" height="16" />
                                    <span className="col-md-2"><EditableQuantity value={targetQty} onChange={this.handleVolTargetChange} /></span>
                                </span>
                                <button type="button" onClick={this.handleScale} disabled={targetQty.value===0}>recalculer</button>
                            </span>
                        </li>
                        <li className="important">
                            <span className="drink libelized">Alcool</span>
                            <span >{ receipe.diluatedSugar().alcohol.toFixed(1)}</span>
                            <span className="unit">%Vol</span>
                        </li>
                        <li className="screenable">
                            <span className="water libelized">Volume d'emp??tage</span>
                            <span >{ receipe.advicedMashingVolume().convertTo('volume.l').toFixed(1) }</span>
                            <span className="unit">L</span>
                        </li>
                        <li className={!needRincing ? 'alert-danger screenable' : 'screenable'}>
                            <span className="water libelized">Volume de rin??age</span>
                            <span >{ receipe.advicedRincingVolume().convertTo('volume.l').toFixed(1) }</span>
                            <span className="unit">L</span>
                            { !needRincing && <span>
                                <FontAwesomeIcon className="left-space-m16 right-space-m8" icon={faExclamationTriangle} />
                                Ajoutez de l'eau, j'ai soif !
                                </span> }
                        </li>
                        <li>
                            <span className="gravity libelized">Densit?? initiale</span>
                            <span >{ receipe.diluatedSugar().specificGravity.toFixed(3) }</span>
                        </li>
                        <li>
                            <span className="hops libelized">IBU</span>
                            <span >{ receipe.ibu().toFixed(1) }</span>
                        </li>
                        <li>
                            <span className="drink libelized">Couleur</span>
                            <span className="beer-color badge" style={ { backgroundColor: beerColor.rgb, color: textColor } }>{ receipe.color().srm.toFixed(1) }</span>
                        </li>
                    </ul>
                </div>
            </header>

            <Accordion className="screenable">
                {receipe.steps.map((step: Step, index: number) => {
                    return <div
                            key={step.uuid}
                            onDragStart={this.onDragStart(index)}
                            onDragEnd={this.onDragEnd}
                            onDragOver={this.onDragOver(index)}
                            draggable={toDrag === index}
                            className={step.uuid === dragStepUuid ? 'dragging process-item' : 'process-item'}
                            >
                        <span className="handle"
                            onMouseDown={this.handleMouseDownHdl(index)}
                        ><FontAwesomeIcon icon={faBars} /></span>
                        <span className="accordion-block"><Accordion.Title active={activeSteps[index]} index={index} onClick={this.handleClick(index)}>
                            <div className="step-title">
                                <Icon name="dropdown" />
                                <span className="step-name">
                                    <EditableText<string>
                                        value={step.name}
                                        onChange={this.handleStepNameChange(step)}/>
                                    </span>
                                <div className="process-temperature">
                                    <EditableText<number>
                                        value={step.temperature}
                                        onChange={this.handleStepTemperatureChange(step)}
                                        template={ (temperature: number) => `${temperature} ??C` }/>
                                </div>
                                <div className="process-duration">
                                    <FontAwesomeIcon icon={faClock} />
                                    <EditableText<number>
                                        value={step.lasting}
                                        onChange={this.handleStepLastingChange(step)}
                                        template={ (lasting: number) => `${lasting} min` }/>
                                </div>
                                <ConfirmButton className="step-delete" onAccept={this.handleStepRemove(step)}><FontAwesomeIcon icon={faTrash} /></ConfirmButton>
                            </div>
                        </Accordion.Title>
                        <Accordion.Content active={activeSteps[index]}>
                            <StepComponent step={step} onChange={this.handleStepChange(step)}/>
                        </Accordion.Content></span>
                    </div>;
                })}
            </Accordion>

            <div className="printable">
            {receipe.steps.map((step: Step, index: number) => {
                return <div
                key={step.uuid}
                className='process-item'
                >
                    <div className="step-title">
                        <span className="step-name">{step.name}</span>
                        <div className="process-temperature">{step.temperature} ??c</div>
                        <div className="process-duration">
                            <FontAwesomeIcon icon={faClock} />
                            <span className="left-space-m4">{
                                step.lasting>24*60 ?
                                `${Math.round(step.lasting/(24*60))} jour(s)`: 
                                `${leading(Math.floor(step.lasting / 60))}:${leading(step.lasting % 60)}`
                            }</span>
                        </div>
                    </div>
                    <StepComponent step={step} onChange={this.handleStepChange(step)}/>
                </div>
            })}
            </div>
            
            <button type="button" className="btn btn-link step-delete" onClick={this.handleStepAdd}><FontAwesomeIcon icon={faPlus} /></button>
        </div>;
    }
}