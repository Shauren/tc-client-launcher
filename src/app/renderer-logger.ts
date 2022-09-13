import { Injectable } from '@angular/core';

import { LogEvent, Logger } from '../desktop-app/logger';
import { environment } from '../environments/environment';
import { Argv } from './argv';

@Injectable()
export class RendererLogger extends Logger {

    private readonly logFn: (message?: any, ...optionalParams: any[]) => void;
    private readonly errorFn: (message?: any, ...optionalParams: any[]) => void;

    constructor(private argv: Argv) {
        super();
        this.logFn = this.resolveLogFunction('log');
        this.errorFn = this.resolveLogFunction('error');
    }

    log(message?: any, ...optionalParams: any[]): void {
        this.logFn.apply(this, arguments);
    }

    error(message?: any, ...optionalParams: any[]): void {
        this.errorFn.apply(this, arguments);
    }

    private resolveLogFunction(fn: keyof Console): (message?: any, ...optionalParams: any[]) => void {
        if (environment.production) {
            if (this.argv['logging-enabled']) {
                return function productionLogEvent() {
                    window.electronAPI.log(new LogEvent(fn, Array.prototype.slice.call(arguments)));
                };
            } else {
                return function noopLogEvent() { };
            }
        }
        if (this.argv['logging-enabled']) {
            return function devLogEvent() {
                const args = Array.prototype.slice.call(arguments);
                window.electronAPI.log(new LogEvent(fn, args));
                console[fn].apply(console, args);
            };
        }
        return function devConsoleLogEvent() {
            console[fn].apply(console, arguments);
        };
    }
}
