import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginTicketService } from '../login-ticket.service';

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
        private router: Router,
        private loginTicket: LoginTicketService) {
    }

    ngOnInit(): void {
        window.electronAPI.onOpenSettingsRequest(() => {
            this.zone.runGuarded(() => {
                this.openSettings = true;
                this.changeDetector.markForCheck();
            });
        });
        window.electronAPI.onLogoutRequest(() => {
            this.zone.runGuarded(() => {
                this.loginTicket.clear();
                this.router.navigate(['/login']);
            });
        });
    }
}
