export class Configuration {
    WowInstallDir: string;
    LoginServerUrl: string;
    RememberLogin: boolean;
    LastGameAccount: string;
}

export function getDefaultConfiguration(): Configuration {
    return {
        WowInstallDir: 'C:\\Program Files (x86)\\World of Warcraft',
        LoginServerUrl: 'https://localhost:8081/bnetserver',
        RememberLogin: false,
        LastGameAccount: ''
    };
}
