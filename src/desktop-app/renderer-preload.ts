import { contextBridge, ipcRenderer } from 'electron';
import { ElectronApi } from '../ipc/electron-api';
import { Configuration } from '../ipc/configuration';
import { CryptoResult } from '../ipc/crypto-result';
import { ILogEvent } from '../ipc/log-event';
import { LaunchArgs } from '../ipc/launch-args';

const api: ElectronApi = {
    getArgv(): { [p: string]: any } {
        return ipcRenderer.sendSync('get-argv');
    },
    getConfiguration(): Configuration {
        return ipcRenderer.sendSync('get-configuration');
    },
    setConfiguration<Key extends keyof Configuration>(change: [Key, Configuration[Key]]): Promise<Configuration> {
        return ipcRenderer.invoke('configuration', change);
    },
    encrypt(data: string): Promise<CryptoResult> {
        return ipcRenderer.invoke('encrypt', data);
    },
    decrypt(data: string): Promise<CryptoResult> {
        return ipcRenderer.invoke('decrypt', data);
    },
    log(event: ILogEvent): void {
        ipcRenderer.send('logger', event);
    },
    login() {
        ipcRenderer.send('login');
    },
    launchGame(args: LaunchArgs) {
        ipcRenderer.send('launch-game', args);
    },
    selectDirectory(): Promise<{ filePaths: string[]; canceled: boolean }> {
        return ipcRenderer.invoke('select-directory');
    },
    onOpenSettingsRequest(callback: () => void) {
        ipcRenderer.on('open-settings', callback);
    },
    onLogoutRequest(callback: () => void) {
        ipcRenderer.on('logout', callback);
    }
};

contextBridge.exposeInMainWorld('electronAPI', api);
