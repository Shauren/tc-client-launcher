import { Injectable, OnDestroy } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { Configuration } from '../electron/configuration';

@Injectable()
export class ConfigurationService implements OnDestroy {

    private settingsCache: Configuration;

    constructor(private electronService: ElectronService) {
        this.settingsCache = this.electronService.ipcRenderer.sendSync('init-configuration');
        this.electronService.ipcRenderer.on('configuration-response', (event, args) => {
            this.settingsCache = args;
        });
    }

    ngOnDestroy(): void {
        this.electronService.ipcRenderer.removeAllListeners('configuration-response');
    }

    get WowInstallDir(): string {
        return this.settingsCache.WowInstallDir;
    }

    set WowInstallDir(wowInstallDir: string) {
        this.electronService.ipcRenderer.send('configuration', ['WowInstallDir', wowInstallDir]);
    }

    get Use64Bit(): boolean {
        return this.settingsCache.Use64Bit;
    }

    set Use64Bit(use64Bit: boolean) {
        this.electronService.ipcRenderer.send('configuration', ['Use64Bit', use64Bit]);
    }

    get LoginServerUrl(): string {
        return this.settingsCache.LoginServerUrl;
    }

    set LoginServerUrl(loginServerUrl: string) {
        this.electronService.ipcRenderer.send('configuration', ['LoginServerUrl', loginServerUrl]);
    }

    get RememberLogin(): boolean {
        return this.settingsCache.RememberLogin;
    }

    set RememberLogin(rememberLogin: boolean) {
        this.electronService.ipcRenderer.send('configuration', ['RememberLogin', rememberLogin]);
    }

    get LastGameAccount(): string {
        return this.settingsCache.LastGameAccount;
    }

    set LastGameAccount(lastGameAccount: string) {
        this.electronService.ipcRenderer.send('configuration', ['LastGameAccount', lastGameAccount]);
    }
}
