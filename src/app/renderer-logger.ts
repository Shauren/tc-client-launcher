import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { environment } from '../environments/environment';
import { LogEvent, Logger } from '../electron/logger';

@Injectable()
export class RendererLogger extends Logger {

    private static readonly logFn = RendererLogger.resolveLogFunction('log');
    private static readonly errorFn = RendererLogger.resolveLogFunction('error');

    private static resolveLogFunction(fn: keyof Console): (message?: any, ...optionalParams: any[]) => void {
        if (environment.production) {
            return function productionLogEvent() {
                this.electron.ipcRenderer.send('logger', new LogEvent(fn, Array.prototype.slice.call(arguments)));
            };
        }
        return function devLogEvent() {
            const args = Array.prototype.slice.call(arguments);
            this.electron.ipcRenderer.send('logger', new LogEvent(fn, args));
            console[fn].apply(console, args);
        };
    }

    constructor(private electron: ElectronService) {
        super();
    }

    log(message?: any, ...optionalParams: any[]): void {
        RendererLogger.logFn.apply(this, arguments);
    }

    error(message?: any, ...optionalParams: any[]): void {
        RendererLogger.errorFn.apply(this, arguments);
    }
}
