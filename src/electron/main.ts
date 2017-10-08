import * as commandLineArgs from 'command-line-args';
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import * as electronSettings from 'electron-settings';

import { Configuration, getDefaultConfiguration } from './configuration';
import { CryptoResult } from './crypto-result';
import { LaunchArgs } from './launch-args';
import { Logger } from './logger';
import { MainLogger } from './main-logger';

const nativeLauncher: Launcher = require('./tc_launcher.node');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let applicationWindow: Electron.BrowserWindow;
let commandLine: { [arg: string]: any };
let configuration: Configuration;
let logger: Logger;
let logoutMenuItem: Electron.MenuItemConstructorOptions;

function cleanup() {
    logger.close();
    logger = undefined;
    configuration = undefined;
}

function parseArgv() {
    commandLine = commandLineArgs([{
        name: 'logging-enabled', alias: 'l', type: Boolean
    }], { partial: true });
}

function initializeLogging() {
    logger = new MainLogger();
    if (commandLine['logging-enabled']) {
        (<MainLogger>logger).enableLogging();
    }
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
    applicationWindow = new BrowserWindow({
        width: 640,
        height: 480,
        backgroundColor: '#2D2D30',
        show: false
    });

    ipcMain.once('get-argv', (event: Electron.Event) => {
        event.returnValue = commandLine;
    });

    // and load the index.html of the app.
    applicationWindow.loadURL(`file://${__dirname}/index.html`);

    // Emitted when the window is closed.
    applicationWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        applicationWindow = undefined;
    });

    applicationWindow.on('ready-to-show', () => {
        applicationWindow.show();
    });
}

function setLogoutMenuVisible(visible: boolean) {
    const windowMenuItems: Electron.MenuItem[] =
        (<any>Menu.getApplicationMenu().items.find(menuItem => menuItem.label === 'Window')).submenu.items;
    const logoutIndex = windowMenuItems.findIndex(menuItem => menuItem.label === 'Logout');
    windowMenuItems[logoutIndex].visible = visible;
}

function createMenu() {
    ipcMain.on('login', () => {
        setLogoutMenuVisible(true);
    });

    logoutMenuItem = {
        label: 'Logout', visible: false, click: () => {
            applicationWindow.webContents.send('logout');
            setLogoutMenuVisible(false);
        }
    };

    let template: Electron.MenuItemConstructorOptions[];

    if (process.platform !== 'darwin') {
        template = [
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Settings',
                        click: () => {
                            applicationWindow.webContents.send('open-settings');
                        }
                    },
                    // { role: 'toggledevtools' },
                    { type: 'separator' },
                    logoutMenuItem,
                    { role: 'minimize' },
                    { role: 'close' }
                ]
            }
        ];
    } else {
        template = [
            {
                label: app.getName(),
                submenu: [
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            // mac does not support copy/paste if these items aren't in menu... how retarded is that?
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'pasteandmatchstyle' },
                    { role: 'delete' },
                    { role: 'selectall' }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'close' },
                    { role: 'minimize' },
                    logoutMenuItem,
                    { type: 'separator' },
                    { role: 'front' },
                    // { role: 'toggledevtools' }
                ]
            }];
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function setupCrypto() {
    ipcMain.on('encrypt', (event: Electron.Event, args: string) => {
        try {
            const result = nativeLauncher.encryptString(args);
            event.sender.send('encrypt', new CryptoResult(true, result.toString('base64')));
        } catch (e) {
            logger.error(`Crypto | Failed to encrypt string: ${(e as Error).message}`);
            event.sender.send('encrypt', new CryptoResult(false));
        }
    });
    ipcMain.on('decrypt', (event: Electron.Event, args: string) => {
        try {
            const result = nativeLauncher.decryptString(Buffer.from(args, 'base64'));
            event.sender.send('decrypt', new CryptoResult(true, result));
        } catch (e) {
            logger.error(`Crypto | Failed to decrypt string: ${(e as Error).message}`);
            event.sender.send('decrypt', new CryptoResult(false));
        }
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    parseArgv();

    initializeLogging();

    loadConfig();

    createWindow();

    createMenu();

    setupCrypto();

    ipcMain.on('open-directory-selection', (event: Electron.Event) => {
        event.sender.send('directory-selected', dialog.showOpenDialog(applicationWindow, { properties: ['openDirectory'] }));
    });

    ipcMain.on('launcher', (event: Electron.Event, args: LaunchArgs) => {
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

app.on('quit', () => {
    cleanup();
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
