import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { LoginTicketService } from './login-ticket.service';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const ticket = LoginTicketService.getTicket();
        if (!!ticket) {
            req = req.clone({ setHeaders: { Authorization: `Basic ${btoa(ticket + ':*')}` } });
        }
        return next.handle(req);
    }
}
