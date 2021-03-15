import * as React from 'react'
import { Receipe } from '../../model/receipe';
import Data from '../../service/data';
import {v4 as uuidv4} from 'uuid';
import './receipe.scss';
import { EditableText } from '../editable/text/editable-text';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import { Color } from '../../service/color';
import { Step } from '../../model/step';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faExclamationTriangle, faClock, faBars } from '@fortawesome/free-solid-svg-icons';
import { SemanticDatepickerProps } from 'react-semantic-ui-datepickers/dist/types';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';


interface ReceipeProps {
};


interface ReceipeState {
    receipe: Receipe;
    activeSteps: boolean[];
    toDrag: number | undefined;
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
        }

        Data.dataReady().subscribe({
            next: () => {
                this.getReceipe();
            }
        });
    }

    handleTitleChange = (name: string) => {
        this.setState({
            receipe: Receipe.fromApi({ ...this.state.receipe, name })
        });
    }

    getReceipe() {
        this.uuid = uuidv4();
        const api = new Data();
        api.getData().subscribe({
            next: (receipe: Receipe) => {
                this.setState({ receipe })
            }
        });
    }

    componentDidMount(): void {
        this.getReceipe();
    }

    //onDateChange = (date: Date | Date[] | null) => {
    onDateChange = (event: React.SyntheticEvent<Element, Event> | undefined, data: SemanticDatepickerProps) => {
        const date = data.value;
        if (date) {
            if (Array.isArray(date) && date.length > 1 && !isNaN(date[0].getTime())) {
                this.setState({
                    receipe: Receipe.fromApi({
                        ...this.state.receipe,
                        date: date[0],
                    }),
                });
            } else if (!isNaN((date as Date).getTime())) {
                this.setState({
                    receipe: Receipe.fromApi({
                        ...this.state.receipe,
                        date,
                    }),
                });
            } else {
                this.setState({
                    receipe: Receipe.fromApi({
                        ...this.state.receipe,
                        date: new Date(),
                    }),
                });
            }
        }
    }

    
    render() :any {
        const receipe: Receipe = this.state.receipe || new Receipe('', new Date(), '');
        const activeSteps: boolean[] = this.state.activeSteps || [];
        const beerColor: Color = receipe.color();
        const textColor: string = (beerColor.hsv.saturation > 50 ? '#000' : '#fff');
        const needRincing: boolean = (receipe.advicedRincingVolume().value > 0);
        const toDrag = this.state.toDrag;
        const dragStepUuid = this.dragStep ? this.dragStep.uuid : '';
        return <div className="receipe">
        <h2 className="text-center">
            <EditableText<string> value={receipe.name} onChange={this.handleTitleChange}/>
        </h2>
        <header>
                <div>
                    <div className="bottom-space-m16">
                        <label className="right-space-m16">Date</label>
                        <SemanticDatepicker
                            onChange={this.onDateChange}
                            pointing="left"
                            type="basic"
                            locale="fr-FR"
                            value={receipe.date}/>
                    </div>
                    <ul className="features">
                        <li>
                            <span className="water libelized">Volume d'empâtage</span>
                            <span >{ receipe.advicedMashingVolume().convertTo('volume.l').toFixed(1) } L</span>
                        </li>
                        <li className={!needRincing ? 'alert-danger' : ''}>
                            <span className="water libelized">Volume de rinçage</span>
                            <span >{ receipe.advicedRincingVolume().convertTo('volume.l').toFixed(1) } L</span>
                            { !needRincing && <span>
                                <FontAwesomeIcon className="left-space-m16 right-space-m8" icon={faExclamationTriangle} />
                                Ajoutez de l'eau, j'ai soif !
                                </span> }
                        </li>
                        <li>
                            <span className="water libelized">Volume final</span>
                            <span >{ receipe.finalVolume().convertTo('volume.l').toFixed(1) } L</span>
                        </li>
                        <li>
                            <span className="gravity libelized">Densité initiale</span>
                            <span >{ receipe.diluatedSugar().specificGravity.toFixed(3) }</span>
                        </li>
                        <li>
                            <span className="hops libelized">IBU</span>
                            <span >{ receipe.ibu().toFixed(1) }</span>
                        </li>
                        <li>
                            <span className="drink libelized">Alcool</span>
                            <span >{ receipe.diluatedSugar().alcohol.toFixed(1)} %Vol</span>
                        </li>
                        <li>
                            <span className="drink libelized">Couleur</span>
                            <span className="beer-color badge" style={ { backgroundColor: beerColor.rgb, color: textColor } }>{ receipe.color().srm.toFixed(1) }</span>
                        </li>
                    </ul>
                </div>
            </header>
        </div>;
    }
}