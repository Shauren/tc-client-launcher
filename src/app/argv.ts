export class Argv {
    [key: string]: any;
}

export function argvFactory() {
    return window.electronAPI.getArgv();
}
