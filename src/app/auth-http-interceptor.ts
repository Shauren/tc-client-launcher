import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ConfigurationService } from './configuration.service';
import { LoginTicketService } from './login-ticket.service';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {

    constructor(private configuration: ConfigurationService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const ticket = LoginTicketService.getTicket(this.configuration.RememberLogin);
        if (!!ticket) {
            req = req.clone({ setHeaders: { Authorization: `Basic ${btoa(ticket + ':*')}` } });
        }
        return next.handle(req);
    }
}
