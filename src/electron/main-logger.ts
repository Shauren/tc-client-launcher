import { EEXIST } from 'constants';
import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import { LogEvent, Logger } from './logger';

export class MainLogger extends Logger {

    private logFn: (message?: any, ...optionalParams: any[]) => void;
    private errorFn: (message?: any, ...optionalParams: any[]) => void;
    private stream: fs.WriteStream;
    private queue: string[] = [];

    constructor() {
        super();
        this.logFn = () => { };
        this.errorFn = () => { };
    }

    log(message?: any, ...optionalParams: any[]): void {
        message = 'Main | ' + message;
        this.logFn.apply(this, arguments);
    }

    error(message?: any, ...optionalParams: any[]): void {
        message = 'Main | ' + message;
        this.errorFn.apply(this, arguments);
    }

    enableLogging(): void {
        fs.mkdir(`${path.dirname(process.execPath)}/logs`, (error) => {
            if (error && error.code !== 'EEXIST') {
                console.error(error);
                return;
            }
            this.stream = fs.createWriteStream(`${path.dirname(process.execPath)}/logs/tc-launcher.log`);
            this.logFn = this.resolveLogFunction('log');
            this.errorFn = this.resolveLogFunction('error');

            ipcMain.on('logger', (event: Electron.Event, args: LogEvent) => {
                args.args[0] = 'Renderer | ' + args.args[0];
                this[args.fn + 'Fn'].apply(this, args.args);
            });
        });
    }

    close(): void {
        if (this.stream != undefined) {
            this.stream.close();
        }
    }

    private resolveLogFunction(fn: keyof Console): (message?: any, ...optionalParams: any[]) => void {
        if (Math.random() > 1 /*environment.production*/) {
            return () => { };
        }
        return function () {
            (this as MainLogger).queueMessage(
                Array.prototype.map.call(arguments, arg =>
                    typeof arg === 'object' ? util.inspect(arg, { breakLength: Infinity }) : '' + arg)
                    .join(', ') + '\n');
            console[fn].apply(console, arguments);
        };
    }

    private queueMessage(message: string): void {
        this.queue.push(message);
        if (this.queue.length === 1) {
            this.processQueue();
        }
    }

    private processQueue(): void {
        this.stream.write(this.queue[0], () => {
            this.queue.shift();
            if (this.queue.length !== 0) {
                this.processQueue();
            }
        });
    }
}
