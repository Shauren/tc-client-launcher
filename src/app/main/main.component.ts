import { Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
    selector: 'tc-main',
    templateUrl: './main.component.html'
})
export class MainComponent implements OnInit {

    openSettings = false;

    constructor(
        private zone: NgZone,
        private electron: ElectronService) {
    }

    ngOnInit(): void {
        this.electron.ipcRenderer.on('open-settings', () => {
            this.zone.runGuarded(() => {
                this.openSettings = true;
            });
        });
    }
}
