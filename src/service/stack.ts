import objectHash from 'object-hash';

export default class Stack<T> {
    public data: T[] = [];
    public cursor: number = 0;

    constructor(d: T) {
        this.data.push(d);
    }

    public push(d: T) {
        const lastDataSig = objectHash.MD5(this.data[this.cursor])
        const currentSig = objectHash.MD5(d);
        if (lastDataSig !== currentSig) {
            this.data = this.data.slice(0, this.cursor+1);
            this.data.push(d);
            this.cursor = this.data.length - 1;
            console.log(this.cursor, this.data);
        }
    }

    public cancel(): T {
        this.cursor = this.cursor ? this.cursor-1:this.cursor;
        console.log(this.cursor, this.data);
        return this.data[this.cursor];
    }

    public redo(): T {
        this.cursor = this.cursor < this.data.length-1 ? this.cursor+1:this.cursor;
        console.log(this.cursor, this.data);
        return this.data[this.cursor];
    }
}