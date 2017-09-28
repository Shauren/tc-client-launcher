import { Injectable } from '@angular/core';

@Injectable()
export class LoginTicketService {

    getTicket(): string {
        return sessionStorage.getItem('ticket');
    }

    store(loginTicket: string, rememberLogin: boolean): void {
        sessionStorage.setItem('ticket', loginTicket);
    }

    clear(): void {
        sessionStorage.removeItem('ticket');
    }
}
