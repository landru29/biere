import { Observable, Subscriber } from 'rxjs';
import customData from '../data.json';
import { Receipe } from '../model/receipe';

export default class Data {
    static localData: Receipe | null = null;
    static subscriber: Subscriber<boolean>[] = [];

    public static dataReady(): Observable<boolean> {
        return new Observable<boolean>(subscriber => {
            Data.subscriber.push(subscriber);
        });
    }

    public getData(): Observable<Receipe> {
        return new Observable<Receipe>(subscriber => {
            if (Data.localData === null) {
                subscriber.next(Receipe.fromApi(customData));
            } else {
                subscriber.next(Data.localData);
            }
            subscriber.complete();
        });
    }

    public static listenOpenFile() {
        const electron = window.require("electron")
        electron.ipcRenderer.on('open-file', (event: any, ...args: any[]) => {
            console.log("yolo", args);
            const fs = window.require('fs');
            try {
                const sourceData = fs.readFileSync(args[0]);
                const obj = JSON.parse(sourceData);
                Data.localData = Receipe.fromApi(obj);
                Data.subscriber.forEach((s: Subscriber<boolean>) => s.next(true))
            } catch (e) {
                console.log("impossible to open file", e)
            }
        });
    }
}