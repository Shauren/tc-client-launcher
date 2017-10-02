import 'rxjs/add/operator/do';

import { HttpErrorResponse, HttpInterceptor } from '@angular/common/http';
import { HttpEvent, HttpEventType, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Logger } from '../electron/logger';

@Injectable()
export class LoggingHttpInterceptor implements HttpInterceptor {

    constructor(private logger: Logger) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.logger.log(`Http | ${req.method} (begin) - ${req.url}`);
        const start = Date.now();
        return next.handle(req).do({
            next: (event: HttpEvent<any>) => {
                if (event.type === HttpEventType.Response) {
                    const duration = Date.now() - start;
                    this.logger.log(`Http | ${req.method}  (done) - ${event.url} - ${event.statusText} - took ${duration}ms`);
                }
            },
            error: (error: HttpErrorResponse) => {
                const duration = Date.now() - start;
                if (error.error instanceof Error) {
                    this.logger.error(`Http | ${req.method} (error) - ${error.url} - ${error.error.message} - took ${duration}ms`);
                } else {
                    this.logger.error(`Http | ${req.method} (error) - ${error.url} - ${error.statusText} - took ${duration}ms`);
                }
            }
        });
    }
}
