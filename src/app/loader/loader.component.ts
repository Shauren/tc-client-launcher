import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { Logger } from '../../desktop-app/logger';
import { LoginTicketService } from '../login-ticket.service';
import { LoginService } from '../login/login.service';

@Component({
    selector: 'tc-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent implements OnInit {

    constructor(
        private loginTicket: LoginTicketService,
        private loginService: LoginService,
        private router: Router,
        private logger: Logger) {
    }

    ngOnInit() {
        this.getInitialRoute().subscribe(initialRoute => {
            this.logger.log(`Loader | Resolved initial route to ${initialRoute}`);
            this.router.navigate([initialRoute]);
        });
    }

    private getInitialRoute(): Observable<string> {
        if (this.loginTicket.shouldAttemptRememberedLogin()) {
            return this.loginTicket.restoreSavedTicket().pipe(
                mergeMap(() => {
                    this.logger.log(`Loader | Found remembered login`);
                    return this.loginTicket.refresh();
                }),
                catchError(() => {
                    this.logger.error(`Loader | Error checking remembered login`);
                    return of({ is_expired: true });
                }),
                mergeMap(loginTicketStatus => {
                    this.logger.log(`Loader | Remembered login status: ${loginTicketStatus.is_expired ? 'in' : ''}valid`);
                    return of(loginTicketStatus.is_expired ? '/login' : '/account');
                }));
        }

        this.logger.log(`Loader | Remembered login not found`);
        return of('/login');
    }
}
