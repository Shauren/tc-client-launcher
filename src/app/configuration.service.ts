import { Injectable } from '@angular/core';

import { Configuration } from '../ipc/configuration';

let initialSettings: Configuration;

@Injectable()
export class ConfigurationService {

    private settingsCache: Configuration = initialSettings;

    constructor() {
    }

    get WowInstallDir(): string {
        return this.settingsCache.WowInstallDir;
    }

    set WowInstallDir(wowInstallDir: string) {
        window.electronAPI.setConfiguration(['WowInstallDir', wowInstallDir])
            .then(newConfiguration => this.settingsCache = newConfiguration);
    }

    get LoginServerUrl(): string {
        return this.settingsCache.LoginServerUrl;
    }

    set LoginServerUrl(loginServerUrl: string) {
        window.electronAPI.setConfiguration(['LoginServerUrl', loginServerUrl])
            .then(newConfiguration => this.settingsCache = newConfiguration);
    }

    get RememberLogin(): boolean {
        return this.settingsCache.RememberLogin;
    }

    set RememberLogin(rememberLogin: boolean) {
        window.electronAPI.setConfiguration(['RememberLogin', rememberLogin])
            .then(newConfiguration => this.settingsCache = newConfiguration);
    }

    get LastGameAccount(): string {
        return this.settingsCache.LastGameAccount;
    }

    set LastGameAccount(lastGameAccount: string) {
        window.electronAPI.setConfiguration(['LastGameAccount', lastGameAccount])
            .then(newConfiguration => this.settingsCache = newConfiguration);
    }

    get LastGameVersion(): 'Retail' | 'Classic' | 'ClassicEra' {
        return this.settingsCache.LastGameVersion;
    }

    set LastGameVersion(lastGameAccount: 'Retail' | 'Classic' | 'ClassicEra') {
        window.electronAPI.setConfiguration(['LastGameVersion', lastGameAccount])
            .then(newConfiguration => this.settingsCache = newConfiguration);
    }
}

export function configurationInitializer() {
    return function () {
        return window.electronAPI.getConfiguration()
            .then(value => initialSettings = value);
    };
}
