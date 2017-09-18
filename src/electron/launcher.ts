import { ipcMain } from 'electron';
import * as Registry from 'winreg';
import { execFile } from 'child_process';
import { LaunchArgs } from './launch-args';
import { crypt32, DATA_BLOB } from './crypt32';

export class Launcher {

    listen(): void {
        ipcMain.on('launcher', (event, args: LaunchArgs) => {
            console.log(args);
            let key = new Registry({ hive: Registry.HKCU, key: '\\Software\\TrinityCore\\Battle.net\\Launch Options\\WoW' }).create(err => {
                if (err) {
                    throw err;
                }
                key.set('CONNECTION_STRING', Registry.REG_SZ, '192.168.0.5:3725', csErr => {
                    if (csErr) {
                        throw csErr;
                    }
                    key.set('GAME_ACCOUNT', Registry.REG_SZ, args.GameAccount, gaErr => {
                        if (gaErr) {
                            throw gaErr;
                        }
                        let inputBlob = new DATA_BLOB();
                        inputBlob.cbData = args.LoginTicket.length;
                        inputBlob.pbData = args.LoginTicket;
                        let entropy = new DATA_BLOB();
                        entropy.cbData = 16;
                        entropy.pbData = String.fromCharCode(0xC8, 0x76, 0xF4, 0xAE, 0x4C, 0x95, 0x2E, 0xFE, 0xF2, 0xFA, 0x0F, 0x54, 0x19, 0xC0, 0x9C, 0x43);
                        let outputBlob = new DATA_BLOB();
                        crypt32.CryptProtectData(inputBlob.ref(), null, entropy.ref(), null, null, 1, outputBlob.ref());
                        let loginTicketBinary = '';
                        for (let i = 0; i < outputBlob.cbData; ++i) {
                            loginTicketBinary += outputBlob.pbData.charCodeAt(i);
                        }
                        key.set('WEB_TOKEN', Registry.REG_BINARY, loginTicketBinary, wtErr => {
                            if (wtErr) {
                                throw wtErr;
                            }
                            execFile(`${args.WowInstallDir}\\Wow-64_Patched.exe`, ['-console', '-launcherlogin']);
                        });
                    });
                });
            });
        });
    }
}
