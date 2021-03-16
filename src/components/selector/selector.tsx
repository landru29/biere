import * as React from 'react';
import './selector.scss';
import { Receipe } from '../../model/receipe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons';

interface Props {
    onLoad: (receipe: Receipe) => void;
}

interface State {
    value: boolean;
    disabled: boolean;
}

export default class Selector extends React.PureComponent<Props, State> {

    constructor(props: Props, public state: State) {
        super(props, state);
        this.state = {
            value: false,
            disabled: false,
        };
    }

    handleChange(selectorFiles: FileList | null): void {
        if (selectorFiles && selectorFiles.length === 1) {
            const reader = new FileReader();
            reader.onload = (() => {
                return (e: any) => {
                    try {
                        const data = JSON.parse(atob(e.target.result.replace(/.*base64,/, '')));
                        this.props.onLoad(Receipe.fromApi(data));
                    } catch (e) {
                        console.warn('Cannot open file');
                    }
                };
            })();

              // Read in the image file as a data URL.
            reader.readAsDataURL(selectorFiles[0]);

        }
    }

    render(): JSX.Element {

        return <div className="upload-btn-wrapper">
            <button className="btn">
                <FontAwesomeIcon icon={faFileImport} />
                Importer
            </button>
            <input type="file" name="myfile" onChange={ (e) => this.handleChange(e.target.files) } accept=".json" />
        </div>;
    }
}

