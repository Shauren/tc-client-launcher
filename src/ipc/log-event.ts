export interface ILogEvent {
    fn: keyof Console;
    args: any[];
}
