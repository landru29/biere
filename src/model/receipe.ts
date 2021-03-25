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

import { Step } from './step';
import { Quantity } from './quantity';
import { Unit } from '../service/unit';
import { Ingredient, Grain, Hop } from './ingredient';
import { SugarProperty, Sugar } from '../service/sugar';
import { Color } from '../service/color';
import { BitternessProcess, Ibu } from '../service/ibu';

export class Receipe {

    public uuid: string;
    public steps: Step[] = [];

    constructor(
        public name: string,
        public date: Date,
        public author: string,
    ) {
        this.uuid = Receipe.uuidv4();
    }

    static clone(r: Receipe): Receipe {
        const rec = new Receipe(r.name, r.date, r.author);
        rec.uuid = r.uuid;
        rec.steps = r.steps;
        return rec;
    }

    static uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public stepDown(index: number): void {
        if (index >= this.steps.length - 1) {
            return;
        }
        const step = this.steps.splice(index, 1);
        this.steps = [ ...this.steps.slice(0, index + 1), ...step, ...this.steps.slice(index + 1)];
    }

    public stepUp(index: number): void {
        if (index >= this.steps.length && index > 0) {
            return;
        }
        const step = this.steps.splice(index, 1);
        this.steps = [ ...this.steps.slice(0, index - 1), ...step, ...this.steps.slice(index - 1)];
    }

    grains(maxStep: number = -1): Grain[] {
        return this.steps
        .filter((step: Step, index: number) => maxStep < 0 || index <= maxStep)
        .reduce((total: Grain[], step: Step) => {
            return [ ...total, ...step.ingredients.filter((ingredient: Ingredient) => ingredient.type === 'fermentable')] as Grain[];
        }, []);
    }

    producedSugar(maxStep: number = -1, globalEfficiency: number = 0.75): Quantity {
        return new Quantity(
            globalEfficiency * this.grains(maxStep).reduce((total: number, grain: Grain) => total + grain.producedSugar().convertTo('mass.kg'), 0),
            Unit.fromString('mass.kg'),
        );
    }

    waterRetention(maxStep: number = -1, ratio: number = 1): Quantity {
        return new Quantity(
            this.grains(maxStep).reduce((total: number, grain: Grain) => total + grain.waterRetention().convertTo('volume.l'), 0),
            Unit.fromString('volume.l'),
        );
    }

    advicedMashingVolume(maxStep: number = -1, ratio: number = 3): Quantity {
        return new Quantity(
            this.grains(maxStep).reduce((total: number, grain: Grain) => total + grain.advicedMashingVolume(ratio).convertTo('volume.l'), 0),
            Unit.fromString('volume.l'),
        );
    }

    advicedRincingVolume(grainRetentionRatio: number = 3): Quantity {
        return new Quantity(
            this.totalWater(-1).convertTo('volume.l') - this.advicedMashingVolume(-1, grainRetentionRatio).convertTo('volume.l'),
            Unit.fromString('volume.l'),
        );
    }

    totalWater(maxStep: number = -1): Quantity {
        const water = this.steps
        .filter((step: Step, index: number) => maxStep < 0 || index <= maxStep)
        .reduce((total: number, step: Step) => {
            return total + step.ingredients.reduce((stepTotal: number, ingredient: Ingredient) => {
                return stepTotal + (ingredient.type === 'water' ? ingredient.qty.convertTo('volume.l') : 0);
            }, 0);
        }, 0);
        return new Quantity(
            water,
            Unit.fromString('volume.l'),
        );
    }

    finalVolume(retentionRate: number = 1, boilingLoss: number = 0.03): Quantity {
        return new Quantity(
            (this.totalWater(-1).convertTo('volume.l') - this.waterRetention(-1, retentionRate).convertTo('volume.l')) * (1 - boilingLoss),
            Unit.fromString('volume.l'),
        );
    }

    ibu(): number {
        let globalLasting: number = 0;
        const cloneSteps = [ ...this.steps ];
        const bitternessProcess: BitternessProcess[] = cloneSteps.reverse().reduce((total: BitternessProcess[], step: Step, stepIndex: number) => {
            const sugar = this.diluatedSugar(this.steps.length - stepIndex - 1);
            const volumeL = this.totalWater(this.steps.length - stepIndex - 1).convertTo('volume.l');
            return [...total, ...(step.ingredients.reduce((totalIngredient: BitternessProcess[], ingredient: Ingredient) => {
                const element: BitternessProcess[] = [];
                if (ingredient.type === 'hop') {
                    const hop = ingredient as Hop;
                    globalLasting += step.lasting;
                    element.push({
                        hop,
                        lastingMin: globalLasting,
                        volumeL,
                        gravitySg: sugar.specificGravity,
                    });
                }
                return [...totalIngredient, ...element];
            }, []))];
        }, []);
        return Ibu.compute('tinseth', bitternessProcess);
    }

    diluatedSugar(maxStep: number = -1, residualRate: number = 0.25): SugarProperty {
        const volume = this.totalWater(maxStep).convertTo('volume.l');
        const sugar = this.producedSugar(maxStep).convertTo('mass.kg');
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

    color(): Color {
        return Color.estimate(this.totalWater().convertTo('volume.l'), this.grains());
    }

    scale(factor: number) {
        this.steps.forEach((stp: Step) => stp.scale(factor));
    }

    scaleToFinalVolume(qte: Quantity, retentionRate: number = 1, boilingLoss: number = 0.03) {
        if (qte.unit.family === 'volume') {
            const actualVol = this.finalVolume(retentionRate, boilingLoss).convertTo('volume.l');
            const target = qte.convertTo('volume.l');
            this.scale(target/actualVol);
        }
    }

    static fromApi(data: any): Receipe {
        const receipe = new Receipe(
            (data || {}).name || '',
            new Date((data || {}).date || ''),
            (data || {}).author || '',
        );

        receipe.uuid = `${data.uuid}` || receipe.uuid;

        receipe.steps = ((data || {}).steps || []).map((stepData: any) => Step.fromApi(stepData));
        return receipe;
    }

}
