import { ipcMain } from 'electron';
import * as Registry from 'winreg';
import { spawn } from 'child_process';
import { LaunchArgs } from './launch-args';
import { crypt32, DATA_BLOB, ByteArray } from './crypt32';
import * as ref from 'ref';
import * as array from 'ref-array'

export class Launcher {

    listen(): void {
        ipcMain.on('launcher', (event, args: LaunchArgs) => {
            let key = new Registry({ hive: Registry.HKCU, key: '\\Software\\TrinityCore Developers\\Battle.net\\Launch Options\\WoW', arch: args.Use64Bit ? 'x64' : 'x86' }).create(err => {
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
                        let pDataIn = new DATA_BLOB();
                        pDataIn.cbData = args.LoginTicket.length;
                        pDataIn.pbData = new ByteArray(args.LoginTicket.length);
                        for (let i = 0; i < args.LoginTicket.length; ++i) {
                            pDataIn.pbData[i] = args.LoginTicket.charCodeAt(i);
                        }

                        let pOptionalEntropy = new DATA_BLOB();
                        pOptionalEntropy.cbData = 16;
                        pOptionalEntropy.pbData = new ByteArray(16);
                        pOptionalEntropy.pbData[0] = 0xC8;
                        pOptionalEntropy.pbData[1] = 0x76;
                        pOptionalEntropy.pbData[2] = 0xF4;
                        pOptionalEntropy.pbData[3] = 0xAE;
                        pOptionalEntropy.pbData[4] = 0x4C;
                        pOptionalEntropy.pbData[5] = 0x95;
                        pOptionalEntropy.pbData[6] = 0x2E;
                        pOptionalEntropy.pbData[7] = 0xFE;
                        pOptionalEntropy.pbData[8] = 0xF2;
                        pOptionalEntropy.pbData[9] = 0xFA;
                        pOptionalEntropy.pbData[10] = 0x0F;
                        pOptionalEntropy.pbData[11] = 0x54;
                        pOptionalEntropy.pbData[12] = 0x19;
                        pOptionalEntropy.pbData[13] = 0xC0;
                        pOptionalEntropy.pbData[14] = 0x9C;
                        pOptionalEntropy.pbData[15] = 0x43;

                        let outputBlob = new DATA_BLOB();
                        if (!crypt32.CryptProtectData(pDataIn.ref(), null, pOptionalEntropy.ref(), null, null, 1, outputBlob.ref())) {
                            throw new Error('crypt32!CryptProtectData failed!');
                        }
                        // need to do this again - data is truncated otherwise
                        outputBlob.pbData = new ByteArray(outputBlob.cbData);
                        if (!crypt32.CryptProtectData(pDataIn.ref(), null, pOptionalEntropy.ref(), null, null, 1, outputBlob.ref())) {
                            throw new Error('crypt32!CryptProtectData failed!');
                        }
                        let loginTicketBinary = '';
                        for (let i = 0; i < outputBlob.cbData; ++i) {
                            loginTicketBinary += (0x100 + outputBlob.pbData[i]).toString(16).substr(-2);
                        }
                        key.set('WEB_TOKEN', Registry.REG_BINARY, loginTicketBinary, wtErr => {
                            if (wtErr) {
                                throw wtErr;
                            }
                            let exeName = 'Wow';
                            if (args.Use64Bit) {
                                exeName += '-64';
                            }
                            spawn(`${args.WowInstallDir}\\${exeName}_Patched.exe`, ['-launcherlogin', '-noautolaunch64bit'], {
                                detached: true,
                            });
                        });
                    });
                });
            });
        });
    }
}
