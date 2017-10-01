import { ElectronService } from 'ngx-electron';

export class Argv {
    [key: string]: any;
}

export function argvFactory(electron: ElectronService) {
    return electron.ipcRenderer.sendSync('get-argv');
}
