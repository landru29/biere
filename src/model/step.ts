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

import { Ingredient } from './ingredient';
import { v4 } from 'uuid';

export class Step {

    public lasting: number = 0;
    public temperature: number = 20;
    public ingredients: Ingredient[] = [];
    public uuid: string;

    constructor(
        public name: string,
    ) {
        this.uuid = v4();
    }

    static fromApi(data: any): Step {
        const step = new Step((data || {}).name);
        step.lasting = parseFloat(`${(data || {}).lasting || 0}`);
        step.temperature = parseFloat(`${(data || {}).temperature || 0}`);
        step.ingredients = ((data || {}).ingredients || []).map((ingredientData: any) => Ingredient.fromApi(ingredientData));
        if (data.uuid) {
            step.uuid = data.uuid;
        }
        return step;
    }

    public scale(factor: number) {
        this.ingredients.forEach((ing: Ingredient) => ing.scale(factor));
    }
}
