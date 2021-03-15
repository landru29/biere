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

import { Hop } from '../model/ingredient';

export interface IbuOption {
    precision?: number;
}

export interface BitternessProcess {
    // alphaAcidity: number; // alpha acidity of the hop in percent
    // type: 'pellets' | 'flowers'; // 'pellets' | 'flowers'
    // massGr: number;      // mass of the hop in grams
    hop: Hop;
    volumeL: number;     // volume of liquid in liter
    gravitySg: number; // specific gravity of the liquid in Sg
    lastingMin: number;   // time during which the hops is in the boiling liquide
}

export class Ibu {
    private static computeMethods = {
        rager: (hop: Hop, volumeL: number, gravitySg: number, lastingMin: number) => {
            const ga = (gravitySg > 1.050 ? (gravitySg - 1.050) / 0.2 : 0);
            const utilization = 18.109069 + 13.862039 * Math.tanh((lastingMin - 31.322749) / 18.267743);
            return hop.quantityTo('g') * utilization * hop.correctedAlpha * 10 / (volumeL * (1 + ga));
        },
        /*garetz: (alphaAcidity, massGr, volumeL, gravitySg, lastingMin) => {
            var finalVolume = volumeL;
            var CF = finalVolume / volumeL;
            var BG = (CF * (gravitySg - 1)) + 1;
            var GF = 1 + (BG - 1.050) / 0.2;
        },*/
        tinseth: (hop: Hop, volumeL: number, gravitySg: number, lastingMin: number) => {
            const bignessFactor = 1.65 * Math.pow(0.000125, gravitySg - 1);
            const boilTimeFactor = (1 - Math.exp(-0.04 * lastingMin)) / 4.15;
            const utilization = bignessFactor * boilTimeFactor;
            return hop.quantityTo('g') * utilization * hop.correctedAlpha * 10 / volumeL;
        },
    };

    /**
     * List of methods to compute IBU
     * @returns {Array} List of methods to compute IBU
     */
    static availableMethods(): string[] {
        return Object.keys(Ibu.computeMethods);
    }

    /**
     * @ngdoc method
     * @name compute
     * @methodOf BeerToolbox.Ibu
     * @module BeerToolbox
     * @description
     * Compute IBU
     *
     * @param  method  Computing method
     * @param  data    Bitterness data
     * @param  options Options
     * @returns Ibu
     */
    static compute(method: 'rager' | 'tinseth', data: BitternessProcess[], options: IbuOption = {}): number {
        options = {
            precision: undefined,
            ...options,
        };
        const result = data.reduce((total: number, next: BitternessProcess) => {
            return total + Ibu.computeMethods[method](next.hop, next.volumeL, next.gravitySg, next.lastingMin);
        }, 0);
        if (options.precision) {
            const dec = Math.pow(10, options.precision);
            return Math.round(result * dec) / dec;
        }
        return result;
    }
}
