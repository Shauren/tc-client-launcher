import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ConfigurationService } from './configuration.service';

@Injectable()
export class BnetserverUrlHttpInterceptor implements HttpInterceptor {

    constructor(private configuration: ConfigurationService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req.clone({ url: `${this.configuration.LoginServerUrl}/${req.url}` }));
    }
}
