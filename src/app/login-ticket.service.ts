import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable, Subject, timer } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';

import { CryptoResult } from '../desktop-app/crypto-result';
import { ConfigurationService } from './configuration.service';
import { LoginRefreshResult } from './login-refresh-result';

@Injectable()
export class LoginTicketService implements OnDestroy {

    private ticketRefreshEndSignal = new Subject<void>();

    static getTicket(): string {
        return sessionStorage.getItem('ticket');
    }

    constructor(
        private configuration: ConfigurationService,
        private electron: ElectronService,
        private zone: NgZone,
        private http: HttpClient) {
    }

    ngOnDestroy(): void {
        this.ticketRefreshEndSignal.next();
        this.ticketRefreshEndSignal.complete();
    }

    getTicket(): string {
        return LoginTicketService.getTicket();
    }

    store(loginTicket: string, rememberLogin: boolean): void {
        this.configuration.RememberLogin = rememberLogin;
        sessionStorage.setItem('ticket', loginTicket);
        if (rememberLogin) {
            this.electron.ipcRenderer.once('encrypt', (event, args: CryptoResult) => {
                if (args.success) {
                    localStorage.setItem('ticket', args.output);
                }
            });
            this.electron.ipcRenderer.send('encrypt', loginTicket);
        }
        this.scheduleNextRefresh(new Date().getTime() / 1000 + 900);
    }

    clear(): void {
        sessionStorage.removeItem('ticket');
        localStorage.removeItem('ticket');
        this.ticketRefreshEndSignal.next();
    }

    refresh(): Observable<LoginRefreshResult> {
        return this.http.post<LoginRefreshResult>('refreshLoginTicket/', {});
    }

    private scheduleNextRefresh(newLoginTicketExpiry: number): void {
        timer((newLoginTicketExpiry * 1000 - new Date().getTime()) / 2).pipe(
            takeUntil(this.ticketRefreshEndSignal),
            mergeMap(() => this.refresh()))
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

    restoreSavedTicket(): Observable<void> {
        return new Observable<void>(subscriber => {
            this.electron.ipcRenderer.once('decrypt', (event: Electron.Event, args: CryptoResult) => {
                this.zone.runGuarded(() => {
                    if (args.success) {
                        sessionStorage.setItem('ticket', args.output);
                        subscriber.next();
                        subscriber.complete();
                    } else {
                        subscriber.error();
                    }
                });
            });
            this.electron.ipcRenderer.send('decrypt', localStorage.getItem('ticket'));
        });
    }
}
