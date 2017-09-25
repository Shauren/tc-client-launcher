import { app, BrowserWindow, ipcMain } from 'electron';
import * as electronSettings from 'electron-settings';

import { Configuration, getDefaultConfiguration } from './configuration';
import { LaunchArgs } from './launch-args';

const nativeLauncher: Launcher = require('./tc_launcher.node');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let applicationWindow: Electron.BrowserWindow;
let configuration: Configuration;

function cleanup() {
    applicationWindow = undefined;
    configuration = undefined;
}

function loadConfig() {
    configuration = Object.assign(getDefaultConfiguration(), electronSettings.getAll());
    electronSettings.setAll(<any>configuration);

    ipcMain.on('init-configuration', (event) => { event.returnValue = configuration; });
    ipcMain.on('configuration', (event, args) => {
        if (args != undefined) {
            for (let i = 0; i < args.length; i += 2) {
                if (args[i + 1] == undefined) {
                    delete configuration[args[i]];
                } else {
                    configuration[args[i]] = args[i + 1];
                }
            }
            electronSettings.setAll(<any>configuration);
        }
        event.sender.send('configuration-response', configuration);
    });
}

function createWindow() {
    // Create the browser window.
    applicationWindow = new BrowserWindow({ width: 640, height: 480 });

    // and load the index.html of the app.
    applicationWindow.loadURL(`file://${__dirname}/index.html`);

    // Emitted when the window is closed.
    applicationWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        cleanup();
    });

    ipcMain.on('launcher', (event, args: LaunchArgs) => {
        nativeLauncher.launchGame(args.WowInstallDir, args.Use64Bit, args.Portal, args.LoginTicket, args.GameAccount);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

    loadConfig();

    createWindow();

    ipcMain.on('launcher', (event, args: LaunchArgs) => {
        nativeLauncher.launchGame(
            configuration.WowInstallDir,
            configuration.Use64Bit,
            args.Portal,
            args.LoginTicket,
            args.GameAccount);
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (applicationWindow == undefined) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    while (certificate.issuerCert != undefined) {
        certificate = certificate.issuerCert;
    }
    // TC certificate is self-signed, allow it
    if (certificate.issuerName === 'TrinityCore Battle.net Aurora Root CA' &&
        certificate.fingerprint === 'sha256/ceL7DRTPsMGWEdjIAqIdscvdHLF2qqLO2BKjE11BY1Q=') {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});
