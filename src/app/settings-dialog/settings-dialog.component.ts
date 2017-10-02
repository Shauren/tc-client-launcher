import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

import { Logger } from '../../electron/logger';
import { ConfigurationService } from '../configuration.service';

@Component({
    selector: 'tc-settings-dialog',
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('scaleIn', [
            state('false', style({ visibility: 'hidden', transform: 'translate(-50%, -50%) scale(0.95)' })),
            state('true', style({ visibility: 'visible', transform: 'translate(-50%, -50%) scale(1)' })),
            transition('false => true', animate('100ms ease-out')),
            transition('true => false', animate('100ms ease-in')),
        ])
    ]
})
export class SettingsDialogComponent implements OnChanges {

    @Input()
    display: boolean;

    @Output()
    displayChange = new EventEmitter<boolean>();

    @ViewChild('settingsForm')
    settingsForm: NgForm;

    displayMask = false;

    constructor(
        private configurationService: ConfigurationService,
        private electron: ElectronService,
        private zone: NgZone,
        private changeDetector: ChangeDetectorRef,
        private logger: Logger) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('display' in changes) {
            if (changes['display'].currentValue) {
                this.logger.log('Settings | Opening configuration form');
                this.settingsForm.setValue({
                    loginServerUrl: this.configurationService.LoginServerUrl,
                    gameInstallDir: this.configurationService.WowInstallDir,
                    use64bit: this.configurationService.Use64Bit
                });
                this.displayMask = true;
            } else {
                setTimeout(() => {
                    this.logger.log('Settings | Hiding dialog background');
                    this.displayMask = false;
                    this.changeDetector.markForCheck();
                }, 100);
            }
        }
    }

    saveConfiguration(): void {
        const { loginServerUrl, use64bit } = this.settingsForm.value;
        // disabled controls don't write to .value
        const gameInstallDir = this.settingsForm.controls['gameInstallDir'].value;

        this.logger.log(`Settings | Saving new configuration: { ` +
            `LoginServerUrl: '${loginServerUrl}', ` +
            `WowInstallDir: '${gameInstallDir}', ` +
            `Use64Bit: ${use64bit} }`);

        this.configurationService.LoginServerUrl = loginServerUrl;
        this.configurationService.WowInstallDir = gameInstallDir;
        this.configurationService.Use64Bit = use64bit;
        this.displayChange.emit(false);
    }

    close(): void {
        this.logger.log('Settings | Closing configuration form without saving');
        this.displayChange.emit(false);
    }

    openDirectoryPicker(): void {
        this.logger.log('Settings | Opening directory picker for WowInstallDir');
        this.electron.ipcRenderer.once('directory-selected', (event: Electron.Event, dir: string[]) => {
            if (dir != undefined) {
                this.logger.log(`Settings | New WowInstallDir selected: ${dir[0]}.`);
                this.zone.runGuarded(() => this.settingsForm.controls['gameInstallDir'].setValue(dir[0]));
            } else {
                this.logger.log('Settings | Closed directory picker without selection');
            }
        });
        this.electron.ipcRenderer.send('open-directory-selection');
    }
}
