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

import { Quantity } from './quantity';
import { Unit } from '../service/unit';

export type IngredientType = 'fermentable' | 'hop' | 'water' | 'aroma' | 'yeast';

export class Ingredient {
    public qty: Quantity;
    public unitFamilly: string = 'kg';

    constructor(
        public type: IngredientType,
        public name: string,
    ) {
        this.qty = new Quantity(0, new Unit());
    }

    public scale(factor: number): void {
        this.qty.value *= factor;
    }

    public quantityTo(unit: string): number {
        const unitName = /\./.test(unit) ? unit : `${this.qty.unit.family}.${unit}`;
        return this.qty.convertTo(unitName);
    }

    static fromApi(data: any): Grain | Water | Hop | Aroma | null {
        switch ((data || {}).type) {
                case 'fermentable':
                    return Grain.fromApi(data);
                case 'hop':
                    return Hop.fromApi(data);
                case 'aroma':
                    return Aroma.fromApi(data);
                case 'water':
                    return Water.fromApi(data);
                case 'yeast':
                    return Yeast.fromApi(data);
                default:
                    return null;
        }
    }
}

export class Water extends Ingredient {

    constructor(name: string) {
        super('water', name);
        this.unitFamilly = 'volume';
        this.qty.unit = new Unit('volume', 'l');
    }

    static fromApi(data: any): Water {
        const aroma = new Water((data || {}).name || '');
        aroma.qty = Quantity.fromApi((data || {}).qty);
        return aroma;
    }

}

export class Hop extends Ingredient {
    public alpha: number = 0;
    public form: 'flower' | 'pelet' = 'pelet';

    constructor(name: string) {
        super('hop', name);
        this.unitFamilly = 'mass';
        this.qty.unit = new Unit('mass', 'g');
    }

    get correctedAlpha(): number {
        return /^pellet/.test(this.form) ? 1.1 * this.alpha : this.alpha;
    }

    static fromApi(data: any): Hop {
        const hop = new Hop((data || {}).name || '');
        hop.form = (`${(data || {}).form}`.toLowerCase() === 'pelet' ? 'pelet' : 'flower');
        hop.alpha = parseFloat(`${(data || {}).alpha || 0}`);
        hop.qty = Quantity.fromApi((data || {}).qty);
        return hop;
    }
}

export class Grain extends Ingredient {

    public ebc: number = 0;
    public yield: number = 0.75;

    constructor(name: string) {
        super('fermentable', name);
        this.unitFamilly = 'mass';
        this.qty.unit = new Unit('mass', 'kg');
    }

    static fromApi(data: any): Grain {
        const grain = new Grain((data || {}).name || '');
        grain.ebc = parseFloat(`${(data || {}).ebc || 0}`);
        grain.yield = parseFloat(`${(data || {}).yield || 75}`);
        grain.qty = Quantity.fromApi((data || {}).qty);
        return grain;
    }

    waterRetention(ratio: number = 1): Quantity {
        return new Quantity(
            ratio * this.qty.convertTo('mass.kg'),
            Unit.fromString('volume.l'),
        );
    }

    advicedMashingVolume(ratio: number = 3): Quantity {
        return new Quantity(
            ratio * this.qty.convertTo('mass.kg'),
            Unit.fromString('volume.l'),
        );
    }

    producedSugar(): Quantity {
        return new Quantity(
            this.qty.convertTo('mass.kg') * this.yield / 100,
            Unit.fromString('mass.kg'),
        );
    }

}

export class Aroma extends Ingredient {
    constructor(name: string) {
        super('aroma', name);
        this.unitFamilly = 'mass';
        this.qty.unit = new Unit('mass', 'g');
    }

    static fromApi(data: any): Aroma {
        const aroma = new Aroma((data || {}).name || '');
        aroma.qty = Quantity.fromApi((data || {}).qty);
        return aroma;
    }

}

export class Yeast extends Ingredient {
    constructor(name: string) {
        super('yeast', name);
        this.unitFamilly = 'mass';
        this.qty.unit = new Unit('mass', 'g');
    }

    static fromApi(data: any): Yeast {
        const yeast = new Yeast((data || {}).name || '');
        yeast.qty = Quantity.fromApi((data || {}).qty);
        return yeast;
    }

}
