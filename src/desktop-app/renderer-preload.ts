import { contextBridge, ipcRenderer } from 'electron';
import { ElectronApi } from '../ipc/electron-api';
import { Configuration } from '../ipc/configuration';
import { CryptoResult } from '../ipc/crypto-result';
import { ILogEvent } from '../ipc/log-event';
import { LaunchArgs } from '../ipc/launch-args';

const api: ElectronApi = {
    getArgv: function(): Promise<{ [p: string]: any }> {
        return ipcRenderer.invoke('get-argv');
    },
    getConfiguration: function(): Promise<Configuration> {
        return ipcRenderer.invoke('get-configuration');
    },
    setConfiguration: function<Key extends keyof Configuration>(change: [Key, Configuration[Key]]): Promise<Configuration> {
        return ipcRenderer.invoke('configuration', change);
    },
    encrypt: function(data: string): Promise<CryptoResult> {
        return ipcRenderer.invoke('encrypt', data);
    },
    decrypt: function(data: string): Promise<CryptoResult> {
        return ipcRenderer.invoke('decrypt', data);
    },
    log: function(event: ILogEvent): void {
        ipcRenderer.send('logger', event);
    },
    login: function() {
        ipcRenderer.send('login');
    },
    launchGame: function(args: LaunchArgs) {
        ipcRenderer.send('launch-game', args);
    },
    selectDirectory: function(): Promise<{ filePaths: string[]; canceled: boolean }> {
        return ipcRenderer.invoke('select-directory');
    },
    onOpenSettingsRequest: function(callback: () => void) {
        ipcRenderer.on('open-settings', callback);
    },
    onLogoutRequest: function(callback: () => void) {
        ipcRenderer.on('logout', callback);
    }
};

contextBridge.exposeInMainWorld('electronAPI', api);
