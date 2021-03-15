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

import { Grain } from '../model/ingredient';
import { Unit } from './unit';

export interface HSV {
    hue: number;
    value: number;
    saturation: number;
}

export class Color {
    public srm: number = 0;
    public rgb: string = '';
    public rgbNum: number = 0;
    public hsv: HSV = { hue: 0, value: 0, saturation: 0 };

    static numToHex(num: number): string {
        let toHex = (i: number) => {
            let s = '00' + i.toString(16);
            return s.substring(s.length - 2);
        };
        const b = num % 256;
        const g = ((num - b) % 65536) / 256;
        const r = Math.floor(num / 65536);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    static RGB2HSV(rgbNum: number): HSV {
        const b = rgbNum % 256;
        const g = ((rgbNum - b) % 65536) / 256;
        const r = Math.floor(rgbNum / 65536);
        const hsv = new Object();
        const max = Math.max(r,g,b);
        const dif = max - Math.min(r,g,b);
        let saturation = (max === 0.0) ? 0 : (100 * dif / max);
        let hue = 0;
        if (saturation === 0) hue = 0;
        else if (r === max) hue = 60.0 * (g - b) / dif;
        else if (g === max) hue = 120.0 + 60.0 * (b - r) / dif;
        else if (b === max) hue = 240.0 + 60.0 * (r - g) / dif;
        if (hue < 0.0) hue += 360.0;
        const value = Math.round(max * 100 / 255);
        hue = Math.round(hue);
        saturation = Math.round(saturation);
        return {
            hue,
            saturation,
            value,
        };
    }

    static HSV2RGB(h: number, s: number, v: number): string {
        let toHex = (i: number) => {
            let s = '00' + Math.round(i).toString(16);
            return s.substring(s.length - 2);
        };
        let r: number = 0;
        let g: number = 0;
        let b: number = 0;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
        }
        return `#${toHex(r * 255)}${toHex(g * 255)}${toHex(b * 255)}`;
    }

    /**
     * Compute the corrected density
     * @param liquideVol Volume of liquid
     * @param grains     list of grains <pre>
     * {
     *    massGr: 500, //mass in grams
     *    color: 50, //EBC color
     * }</pre>
     *
     * @return color of the beer
     */
    static estimate(liquidVolume: number, grains: Grain[]): Color {
        const mcu = grains.reduce((all: number, element: Grain) => {
            const lovi = Unit.fromTo(element.ebc, 'color.ebc', 'color.lovibond');
            return all + 8.34540445202 * lovi * (element.quantityTo('mass.kg')) / liquidVolume;
        }, 0);

        let srm = 1.4922 * Math.pow(mcu, 0.6859);
        let rgb = Unit.fromTo(srm, 'color.srm', 'color.rgb');
        return {
            srm: srm,
            rgb: Color.numToHex(rgb),
            rgbNum: rgb,
            hsv: Color.RGB2HSV(rgb),
        };
    }
}
