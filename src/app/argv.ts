export class Argv {
    [key: string]: any;
}

let argv: Argv = {};

export function argvInitializer() {
    return function () {
        return window.electronAPI.getArgv()
            .then(a => argv = a);
    };
}

export function argvFactory() {
    return argv;
}
