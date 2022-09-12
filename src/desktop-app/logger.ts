export abstract class Logger {
    abstract log(message?: any, ...optionalParams: any[]): void;
    abstract error(message?: any, ...optionalParams: any[]): void;
    close() { }
}

export class LogEvent {
    constructor(
        public fn: keyof Console,
        public args: any[]) {
    }
}
