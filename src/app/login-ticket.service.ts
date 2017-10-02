import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';

import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ConfigurationService } from './configuration.service';
import { LoginRefreshResult } from './login-refresh-result';

@Injectable()
export class LoginTicketService implements OnDestroy {

    private ticketRefreshEndSignal = new Subject<void>();

    static getTicket(rememberLogin: boolean): string {
        if (rememberLogin) {
            return localStorage.getItem('ticket');
        } else {
            return sessionStorage.getItem('ticket');
        }
    }

    constructor(
        private configuration: ConfigurationService,
        private http: HttpClient) {
    }

    ngOnDestroy(): void {
        this.ticketRefreshEndSignal.next();
        this.ticketRefreshEndSignal.complete();
    }

    getTicket(): string {
        return LoginTicketService.getTicket(this.configuration.RememberLogin);
    }

    store(loginTicket: string, rememberLogin: boolean): void {
        this.configuration.RememberLogin = rememberLogin;
        if (rememberLogin) {
            localStorage.setItem('ticket', loginTicket);
        } else {
            sessionStorage.setItem('ticket', loginTicket);
        }
        this.scheduleNextRefresh(new Date().getTime() / 1000 + 900);
    }

    clear(): void {
        if (this.configuration.RememberLogin) {
            localStorage.removeItem('ticket');
        } else {
            sessionStorage.removeItem('ticket');
        }
        this.ticketRefreshEndSignal.next();
    }

    refresh(): Observable<LoginRefreshResult> {
        return this.http.post<LoginRefreshResult>('refreshLoginTicket/', {});
    }

    private scheduleNextRefresh(newLoginTicketExpiry: number): void {
        Observable
            .timer((newLoginTicketExpiry * 1000 - new Date().getTime()) / 2)
            .takeUntil(this.ticketRefreshEndSignal)
            .flatMap(() => this.refresh())
            .subscribe(r => {
                if (!r.is_expired) {
                    this.scheduleNextRefresh(r.login_ticket_expiry);
                } else {
                    this.ticketRefreshEndSignal.next();
                }
            });
    }

    shouldAttemptRememberedLogin(): boolean {
        return this.configuration.RememberLogin && !!localStorage.getItem('ticket');
    }
}
