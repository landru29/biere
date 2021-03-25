import { Observable, Subscriber } from 'rxjs';
import customData from '../data.json';
import { Receipe } from '../model/receipe';
import Instance from './electron';
import Stack from './stack';

export default class Data {
    static localData: Receipe | null = null;
    static subscriber: Subscriber<boolean>[] = [];
    static stack: Stack<Receipe> = new Stack<Receipe>(Receipe.fromApi(customData));

    public static dataReady(): Observable<boolean> {
        return new Observable<boolean>(subscriber => {
            Data.subscriber.push(subscriber);
        });
    }

    public getData(): Observable<Receipe> {
        return new Observable<Receipe>(subscriber => {
            if (Data.localData === null) {
                Data.setTitle('sans nom *');
                subscriber.next(Receipe.fromApi(customData));
            } else {
                subscriber.next(Data.localData);
            }
            subscriber.complete();
        });
    }

    public static setData(receipe: Receipe) {
        Data.localData = receipe;
        Data.stack.push(receipe);
        Data.setTitle(`${Data.getTitle()} *`);
    }

    public static setTitle(name: string) {
        document.title = `Oh My Beer: ${name}`;
    }

    public static getTitle(): string {
        return `${document.title}`.replace(/\s*\*$/, '').replace(/^.*?:\s*/, '')
    }

    public static electronListener() {
        if (!Instance.isElectron()) {
            return;
        }
        const electron = window.require("electron");
        
        electron.ipcRenderer.on('file-open', (event: any, ...args: any[]) => {
            const fs = window.require('fs');
            try {
                const sourceData = fs.readFileSync(args[0]);
                const obj = JSON.parse(sourceData);
                Data.setTitle(args[0]);
                Data.localData = Receipe.fromApi(obj);
                Data.stack = new Stack<Receipe>(Data.localData);
                Data.subscriber.forEach((s: Subscriber<boolean>) => s.next(true));
            } catch (e) {
                console.log("impossible to open file", e)
            }
        });

        electron.ipcRenderer.on('file-save', (event: any, ...args: any[]) => {
            const fs = window.require('fs');
            try {
                let filename = args[0];
                if (!/\.beer$/.test(filename)) {
                    filename = `${filename}.beer`;
                }
                fs.writeFileSync(filename, JSON.stringify(Data.localData));
                Data.setTitle(filename);
            } catch (e) {
                console.log("impossible to open file", e);
            }
        });

        electron.ipcRenderer.on('file-new', (event: any, ...args: any[]) => {
            Data.localData = null;
            Data.subscriber.forEach((s: Subscriber<boolean>) => s.next(true));
        });

        electron.ipcRenderer.on('edit-cancel', (event: any, ...args: any[]) => {

            Data.localData = Data.stack.cancel();
            Data.subscriber.forEach((s: Subscriber<boolean>) => s.next(true));
        });

        electron.ipcRenderer.on('edit-redo', (event: any, ...args: any[]) => {
            Data.localData = Data.stack.redo();
            Data.subscriber.forEach((s: Subscriber<boolean>) => s.next(true));
        });
    }
}