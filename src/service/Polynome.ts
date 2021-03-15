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

export interface ConversionModel {
    invert: (value: number) => number | null;
    direct: (value: number) => number;
}

export class Polynome extends Array<number> implements ConversionModel {

    constructor(...params: Array<number>) {
        super(...params);
       // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(this, Polynome.prototype);
    }

    get size(): number {
        for (let i = this.length - 1; i >= 0; i++) {
            if (this[i] !== 0) {
                return i + 1;
            }
        }
        return 0;
    }

    /**
     * Solve a polynome equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * @param  value Value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     *
     * @return Set of solutions
     */
    solveEq(value: number): number[] {
        switch (this.size) {
                case 1:
                    return [];
                case 2:
                    return this.firstDegree(value);
                case 3:
                    return this.secondDegree(value);
                case 4:
                    return this.thirdDegree(value);
                default:
                    return [];
        }
    }

    /**
     * Solve the polynome
     * @param   value Value to pass to the polynome
     * @returns Solution
     */
    invert(value: number): number | null {
        let result = this.solveEq(value);
        return result.length ? result[0] : null;
    }

    /**
     * Inject th value in the polynome
     * @param   value Value to pass to the polynome
     * @returns Solution
     */
    direct(value: number): number {
        return this.reduce((all: number, coef: number, degree: number) => {
            return all + coef * Math.pow(value, degree);
        }, 0);
    }

    /**
     * Solve a first degree polynome
     * @param  value Value in the equation a1.x + a0 = value
     * @return solved value
     */
    private firstDegree(value: number): number[] {
        if (this[1]) {
            return [(value - (this[0] ? this[0] : 0)) / this[1]];
        } else {
            return [];
        }
    }

    /**
     * Solve a second degree polynome
     * @param  value Value in the equation a2.x^2 + a1.x + a0 = value
     * @return solved values
     */
    private secondDegree(value: number): number[] {
        const delta = Math.pow(this[1], 2) - 4 * (this[0] - value) * this[2];
        if (delta < 0) {
            return [];
        }
        if (delta === 0) {
            return [-this[1] / (2 * this[2])];
        }
        if (delta > 0) {
            return [
                (-this[1] + Math.sqrt(delta)) / (2 * this[2]),
                (-this[1] - Math.sqrt(delta)) / (2 * this[2]),
            ];
        }
        return [];
    }

    /**
     * Solve a third degree polynome
     * @param  value  Value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * @return solved values
     */
    private thirdDegree(value: number): number[] {
        if (this[3] !== 0) {
            if ((this[1] === 0) && (this[2] === 0)) {
                return [-Math.pow((this[0] - value) / this[3],1 / 3)];
            } else {
                const a0 = (this[0] - value) / this[3];
                const a1 = this[1] / this[3];
                const a2 = this[2] / this[3];
                const a3 = a2 / 3;
                const p = a1 - a3 * a2;
                const q = a0 - a1 * a3 + 2 * Math.pow(a3, 3);
                const delta = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
                if (delta > 0) {
                    const w = Math.pow(-q / 2 + Math.sqrt(delta),1 / 3);
                    return [w - p / (3 * w) - a3];
                }
                if (delta === 0) {
                    return [
                        3 * q / p - a3,
                        -3 * q / (2 * p) - a3,
                        -3 * q / (2 * p) - a3,
                    ];
                }
                if (delta < 0) {
                    const u = 2 * Math.sqrt(-p / 3);
                    const v = -q / (2 * Math.pow(-p / 3, 3 / 2));
                    const t = Math.acos(v) / 3;
                    return [
                        u * Math.cos(t) - a3,
                        u * Math.cos(t + 2 * Math.PI / 3) - a3,
                        u * Math.cos(t + 4 * Math.PI / 3) - a3,
                    ];
                }
            }
        }
        return this.secondDegree(value);
    }

}
