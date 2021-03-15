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

import { Polynome } from './Polynome';

// export interface SugaredMalt {
//     mass: number;
//     yield: number;
// }

export interface SugarProperty {
    brixGravity: number;
    specificGravity: number;
    residualGravity: number;
    platoGravity: number;
    alcohol: number;
}

export class Sugar {
    static sgToBrixPolygon = new Polynome(
        -669.5622,
        1262.7794,
        -775.6821,
        182.4601,
    );

    static sgToPlatoPolygon = new Polynome(
        -616.868,
        1111.14,
        -630.272,
        135.997,
    );

    /**
     * Compute the corrected density
     * @param measuredGravity measured specific gravity
     * @param measuredTemp    temperature in celcius during measurement
     * @param calibrationTemp calibration temperature of the instrument (default 20)
     * @return Specific gravity
     */
    static densityCorrection(measuredGravity: number, measuredTemp: number, calibrationTemp: number = 20): number {
        return (measuredGravity - (calibrationTemp + 288.9414) / (508929.2 * (calibrationTemp + 68.12963)) * Math.pow(calibrationTemp - 3.9863, 2)) / (1 - (measuredTemp + 288.9414) / (508929.2 * (measuredTemp + 68.12963)) * Math.pow(measuredTemp - 3.9863, 2));
    }

    /**
     * Compute the alcohol in percentage volume
     * @param initialGravity  gravity before fermentation
     * @param finalGravity    gravity after fermentation
     * @param additionalSugar quantity, in kg, of sugar added (default 0)
     * @return Alcohol rate
     */
    static gravityToAlcohol(initialGravity: number, finalGravity: number, additionalSugar: number): number {
        return ((((initialGravity - finalGravity) * 1.05) / finalGravity) * 100) / 0.795 + ((additionalSugar * 0.0005) / 0.795) / 10;
    }

    /**
     * Compute the gravity after dilution or evaporation
     * @param initialVolume     Volume before dilution in liter
     * @param gravity           Specific gravity of the initial volume
     * @param additionalVolume  Volume of liquide to add (if negative, evaporation) in liter
     * @param additionalGravity Specific gravity of the additional volume (default 1)
     * @return Specific gravity
     */
    static gravityDilution(initialVolume: number, gravity: number, additionalVolume: number, additionalGravity: number = 1): number {
        const finalVolume = initialVolume + additionalVolume;
        return (gravity * initialVolume + additionalGravity * additionalVolume) / finalVolume;
    }

    /**
     * Compute the volume to boil to reach a final expected volume
     * @param finalVolume       expected volume at the end of the operation (in liter)
     * @param ratioLossBoiling  loss ratio during boiling operation (default 10%)
     * @param rationLossCooling loss ration during cooling operation (default 5%)
     * @return Liquid volume
     */
    static volumeToBoil(finalVolume: number, ratioLossBoiling: number = 0.1, rationLossCooling: number = 0.05): number {
        return finalVolume / ((1 - ratioLossBoiling) * (1 - rationLossCooling));
    }

    /**
     * Convert Brix gravity to specific gravity
     * @param brix gravity (for 10%, enter 10)
     * @return Specific gravity
     */
    static brixToSg(brix: number): number {
        return Sugar.sgToBrixPolygon.invert(brix) || 0;
    }

    /**
     * Convert specific gravity to brix gravity
     * @param sg specific gravity
     * @return Brix gravity
     */
    static sgToBrix(sg: number): number {
        return Sugar.sgToBrixPolygon.direct(sg);
    }

    /**
     * Convert plato gravity to specific gravity
     * @param plato gravity (for 10%, enter 10)
     * @return Specific gravity
     */
    static platoToSg(plato: number): number {
        return Sugar.sgToPlatoPolygon.invert(plato) || 0;
    }

    /**
     * Convert specific gravity to brix gravity
     * @param sg specific gravity
     * @return Plato gravity
     */
    static sgToPlato(plato: number): number {
        return Sugar.sgToPlatoPolygon.direct(plato);
    }

    /**
     * Convert alcohol to specific gravity
     * @param alcohol rate (10 for 10%)
     * @return Specific gravity
     */
    static alcoholToSg(alcohol: number): number {
        return 0.0076 * alcohol;
    }

    /**
     * Convert specific gravity to alcohol rate
     * @param initialSg initial specific gravity
     * @param finalSg   specific gravity after fermentation (default: attenuation 25%)
     * @return Alcohol rate
     */
    static sgToAlcohol(initialSg: number, finalSg?: number): number {
        if ('undefined' === typeof finalSg) {
            finalSg = 1 + (initialSg - 1) / 4;
        }
        return (initialSg - finalSg) / 0.0076;
    }

    /**
     * Compute the densities as a result of the dilution of sugar un a volume of liquide
     * @param volume       volume of the liquide in liter
     * @param sugar        the amount of sugar in kilo
     * @param residualRate residual sugar rate; ie. if 0.25, with initial gravity 1.080,
     *                           the final gravity will be 1.020
     * @return Densities
     */
    static diluateSugar(volume: number, sugar: number, residualRate: number = 0.25): SugarProperty {
        const brix = (volume !== 0) ? 100 * sugar / volume : 0;
        const sg = Sugar.brixToSg(brix);
        const finalSg = 1 + (sg - 1) * residualRate;
        const alcohol = Sugar.sgToAlcohol(sg, finalSg);
        const plato = Sugar.sgToPlato(sg);
        return {
            brixGravity: brix,
            specificGravity: sg,
            residualGravity: finalSg,
            platoGravity: plato,
            alcohol: alcohol,
        };
    }
}
