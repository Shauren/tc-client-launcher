import { Configuration } from './configuration';
import { CryptoResult } from './crypto-result';
import { ILogEvent } from './log-event';
import { LaunchArgs } from './launch-args';

export interface ElectronApi {
    getArgv(): { [key: string]: any; };
    getConfiguration(): Configuration;
    setConfiguration<Key extends keyof Configuration>(change: [Key, Configuration[Key]]): Promise<Configuration>;
    encrypt(data: string): Promise<CryptoResult>;
    decrypt(data: string): Promise<CryptoResult>;
    log(event: ILogEvent): void;
    login(): void;
    launchGame(args: LaunchArgs): void;
    selectDirectory(): Promise<{ filePaths: string[], canceled: boolean }>;
    onOpenSettingsRequest(callback: () => void): void;
    onLogoutRequest(callback: () => void): void;
}

declare global {
    interface Window {
        electronAPI: ElectronApi;
    }
}
