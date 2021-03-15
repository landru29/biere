/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 landru29
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Polynome, ConversionModel } from './Polynome';
import { enumerable } from '../decorators/enumerable';

export interface UnitOption {
    type?: string;
    precision?: number;
}

export class UnitException {
    constructor(public origin: string, public message: string) {}
}

interface ConversionDesc {
    [key: string]: ConversionModel;
}

export class Unit {

    constructor(
        public family: string = 'mass',
        public name: string = 'kg',
    ) {}

    @enumerable(false)
    get type(): string {
        return `${this.family}.${this.name}`;
    }

    set type(str: string) {
        const matcher = str.match(/(([\w-]+)\.)?(.*)/);
        if (matcher) {
            this.family = matcher[2] || '';
            this.name = matcher[3] || '';
        }
    }

    static fromString(str: string): Unit {
        const u = new Unit();
        u.type = str;
        return u;
    }

    static fromApi(data: any): Unit {
        if ((data || {}).type) {
            return Unit.fromString((data || {}).type);
        }
        return new Unit(((data || {}).family || '').toLowerCase(), ((data || {}).name || '').toLowerCase());
    }

    private static data: { [key: string]: ConversionDesc} = {
        temperature: {
            celcius: new Polynome(// kelvin -> celcius
                -273.15,
                1,
            ),
            fahrenheit: new Polynome(// kelvin -> fahrenheit
                -459.67,
                9 / 5,
            ),
            kelvin: new Polynome(// kelvin -> kelvin
                0,
                1,
            ),
        },

        color: {
            ebc: new Polynome(
                0,
                1,
            ),
            srm: new Polynome(
                0,
                1 / 1.97,
            ),
            lovibond: new Polynome(
                0.561051,
                0.374734,
            ),
            mcu: {
                direct: (ebc: number) => {
                    if (ebc / 1.97 >= 10) {
                        return (ebc / 1.97 - (50 / 7)) * 3.5;
                    } else {
                        return 10 - Math.sqrt(100.0 - ebc * 5.0761421);
                    }
                },
                invert: (mcu: number) => {
                    if (mcu >= 10) {
                        return 3.94 * (mcu + 25) / 7;
                    } else {
                        return (100 - Math.pow(10 - mcu, 2)) / 5.0761421;
                    }
                },
            },
            rgb: {
                /*direct: (ebc: number) => {
                    let r = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(0.975, ebc / 1.97))));
                    let g = Math.round(Math.min(255, Math.max(0, 245 * Math.pow(0.88, ebc / 1.97))));
                    let b = Math.round(Math.min(255, Math.max(0, 220 * Math.pow(0.7, ebc / 1.97))));
                    // return '#' + toHex(r) + toHex(g) + toHex(b);
                    return b + 256 * g + 65536 * r;
                },*/
                direct: (ebc) => {
                    const srm = ebc / 1.97;
                    // Returns an RGB value based on SRM
                    let r = 0;
                    let g = 0;
                    let b = 0;

                    if (srm >= 0 && srm <= 1) {
                        r = 240;
                        g = 239;
                        b = 181;
                    } else if (srm > 1 && srm <= 2) {
                        r = 233;
                        g = 215;
                        b = 108;
                    } else if (srm > 2) {
                        // Set red decimal
                        if (srm < 70.6843) {
                            r = 243.8327 - 6.4040 * srm + 0.0453 * srm * srm;
                        } else {
                            r = 17.5014;
                        }
                        // Set green decimal
                        if (srm < 35.0674) {
                            g = 230.929 - 12.484 * srm + 0.178 * srm * srm;
                        } else {
                            g = 12.0382;
                        }
                        // Set blue decimal
                        if (srm < 4) {
                            b = -54 * srm + 216;
                        } else if (srm >= 4 && srm < 7) {
                            b = 0;
                        } else if (srm >= 7 && srm < 9) {
                            b = 13 * srm - 91;
                        } else if (srm >= 9 && srm < 13) {
                            b = 2 * srm + 8;
                        } else if (srm >= 13 && srm < 17) {
                            b = -1.5 * srm + 53.5;
                        } else if (srm >= 17 && srm < 22) {
                            b = 0.6 * srm + 17.8;
                        } else if (srm >= 22 && srm < 27) {
                            b = -2.2 * srm + 79.4;
                        } else if (srm >= 27 && srm < 34) {
                            b = -0.4285 * srm + 31.5714;
                        } else {
                            b = 17;
                        }
                    }

                    return Math.floor(b) + 256 * Math.floor(g) + 65536 * Math.floor(r);
                },
                invert: (rgb: number) => {
                    /*var color = rgb.match(/#(.{2})(.{2})(.{2})/);
                    if (color.length === 4) {
                        var r = parseInt(color[1], 16);
                        var g = parseInt(color[1], 16);
                        var b = parseInt(color[1], 16);
                    }*/
                    return 0;
                },
            },
        },

        sugar: {
            plato: new Polynome(// sg -> plato
                -616.868,
                1111.14,
                -630.272,
                135.997,
            ),
            brix: new Polynome(// sg -> brix
                -669.5622,
                1262.7794,
                -775.6821,
                182.4601,
            ),
            alcohol: new Polynome(// sg -> alcohol
                -1 / 0.76,
                1 / 0.76,
            ),
            sg: new Polynome(// sg -> sg
                0,
                1,
            ),
            gPerLiter: new Polynome(// sg -> grams per liter
                -6695.622,
                12627.794,
                -7756.821,
                1824.601,
            ),
        },

        mass: {
            kg: new Polynome(// kg->kg
                0,
                1,
            ),
            g: new Polynome(// kg->g
                0,
                1000,
            ),
            t: new Polynome(// kg->T
                0,
                0.001,
            ),
            mg: new Polynome(// kg->mg
                0,
                1000000,
            ),
        },

        volume: {
            l: new Polynome(// L -> L
                0,
                1,
            ),
            ml: new Polynome(// L -> ml
                0,
                1000,
            ),
            dl: new Polynome(// L -> dl
                0,
                10,
            ),
            cl: new Polynome(// L -> cl
                0,
                100,
            ),
            dm3: new Polynome(// L -> dm3
                0,
                1,
            ),
            m3: new Polynome(// L -> m3
                0,
                0.001,
            ),
            cm3: new Polynome(// L -> cm3
                0,
                1000,
            ),
            mm3: new Polynome(// L -> mm3
                0,
                1000000,
            ),
            'gal-us': new Polynome(// L -> gal-us
                0,
                0.220,
            ),
            'gal-en': new Polynome(// L -> gal-en
                0,
                0.264,
            ),
            pinte: new Polynome(// L -> pinte
                0,
                1.760,
            ),
        },
    };

    /**
     * @ngdoc method
     * @name fromTo
     * @methodOf UnitsConversion.UnitsConversion
     * @module UnitsConversion
     * @description
     * Convert units
     *
     * @param   {Float} value   Value to convert
     * @param  {String} from    Current unit (type.unit)
     * @param  {String} to      Destination unit (type.unit)
     * @param {Object=} options Options (type, precision)
     *
     * @return {Float} Converted value
     */
    public static fromTo(value: number, from: string, to: string, options?: UnitOption): number {

        const decodeFrom = Unit.fromString(from);
        const decodeTo = Unit.fromString(to);
        const unitTo = decodeTo.name || '';
        const unitFrom = decodeFrom.name || '';

        const opts = {
            type: decodeFrom ? decodeFrom.family : '',
            precision: null,
            ...options,
        };

        if (!Unit.data[opts.type || '']) {
            throw new UnitException('from', `Type ${opts.type} does not exist in the unit conversion system`);
        }
        if (!Unit.data[opts.type || ''][unitFrom || '']) {
            throw new UnitException('from', `Unit ${unitFrom} does not exist for type ${opts.type} => from = ${from}`);
        }
        if (!Unit.data[opts.type || ''][unitTo || '']) {
            throw new UnitException('to', `Unit ${unitTo} does not exist for type ${opts.type} => to = ${to}`);
        }
        const siValue = Unit.data[opts.type || ''][unitFrom || ''].invert(value);
        if ('number' !== typeof siValue) {
            throw new UnitException('from', `Value ${value} (${JSON.stringify(siValue)}) is out of bounce in unit ${unitFrom}, type ${opts.type}`);
        }
        const result = Unit.data[opts.type || ''][unitTo || ''].direct(siValue);
        if (opts.precision) {
            const dec = Math.pow(10, opts.precision);
            return Math.round(result * dec) / dec;
        }

        return result;
    }

    /**
     * Get the list of available units
     * @param  type  Optional unitType (ie 'mass.g')
     * @return Units description array, or the found type
     */
    public static getPhysicalUnits(unitType: string): Unit[] {
        const type = unitType.split(/\./);

        if (!unitType) {
            return Object.keys(Unit.data).reduce((all: Unit[], family: string) => {
                return all.concat(
                    Object.keys(Unit.data[family]).map((name: string) => new Unit(family, name)),
                );
            }, []);
        }

        if (type.length === 1) {
            return Object.keys(Unit.data[type[0]]).map((unit) => new Unit(type[0], unit));
        }

        const families = Object.keys(this.data).filter((family: string) => family === type[0]);
        return families.reduce((all: Unit[], family: string) => {
            return all.concat(
                Object.keys(this.data[family]).filter((name: string) => name === type[1]).map((name: string) => new Unit(family, name)),
            );
        }, []);
    }

    /**
     * Register a new convertion
     * @param   {Array} polynomeCoef Polynome coeficients
     * @param   {String} unit         Unit (type.unit | unit)
     * @param  {String=} type         Unit type (if not specified in unit)
     */
    public static registerConversion(polynomeCoef: number[], unit: string, type?: string): void {
        const myUnit = Unit.fromString(unit);
        Unit.data[myUnit.family] = { ...Unit.data[myUnit.family] };
        Unit.data[myUnit.family][myUnit.name] = new Polynome(...polynomeCoef);
    }

}
