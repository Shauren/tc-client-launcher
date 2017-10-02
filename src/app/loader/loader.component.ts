import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { Logger } from '../../electron/logger';
import { LoginRefreshResult } from '../login-refresh-result';
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
            this.logger.log(`Loader | Found remembered login`);
            return this.loginTicket.refresh()
                .catch<LoginRefreshResult, LoginRefreshResult>(() => {
                    this.logger.error(`Loader | Error checking remembered login`);
                    return Observable.of({ is_expired: true });
                })
                .flatMap(loginTicketStatus => {
                    this.logger.log(`Loader | Remembered login status: ${loginTicketStatus.is_expired ? 'in' : ''}valid`);
                    return Observable.of(loginTicketStatus.is_expired ? '/login' : '/account');
                });
        }

        this.logger.log(`Loader | Remembered login not found`);
        return Observable.of('/login');
    }
}
