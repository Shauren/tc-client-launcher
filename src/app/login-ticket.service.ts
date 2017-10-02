import { Injectable } from '@angular/core';

@Injectable()
export class LoginTicketService {

    static getTicket(): string {
        return localStorage.getItem('ticket');
    }

    getTicket(): string {
        return LoginTicketService.getTicket();
    }

    store(loginTicket: string, rememberLogin: boolean): void {
        sessionStorage.setItem('ticket', loginTicket);
    }

    clear(): void {
        sessionStorage.removeItem('ticket');
    }
}
