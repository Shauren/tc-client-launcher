import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
    selector: 'tc-main',
    templateUrl: './main.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {

    openSettings = false;

    constructor(
        private zone: NgZone,
        private changeDetector: ChangeDetectorRef,
        private electron: ElectronService) {
    }

    ngOnInit(): void {
        this.electron.ipcRenderer.on('open-settings', () => {
            this.zone.runGuarded(() => {
                this.openSettings = true;
                this.changeDetector.markForCheck();
            });
        });
    }
}
