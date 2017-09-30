import 'rxjs/add/operator/do';

import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { PartialObserver } from 'rxjs/Observer';

import { Logger } from '../electron/logger';
import { ConfigurationService } from './configuration.service';

export interface RequestLoggingOptions {
    bodyFilter?: (body: any) => any;
    dontLog?: boolean;
}

@Injectable()
export class BnetserverService {

    constructor(
        private http: Http,
        private configuration: ConfigurationService,
        private logger: Logger) {
    }

    get(path: string, options: RequestOptionsArgs = {}, loggingOptions: RequestLoggingOptions = {}): Observable<Response> {
        let responseObservable = this.http.get(`${this.configuration.LoginServerUrl}/${path}`, this.addTicket(options));
        if (!loggingOptions.dontLog) {
            this.logger.log(`GET (begin) - ${this.configuration.LoginServerUrl}/${path}`);
            responseObservable = responseObservable.do(this.logResponse('GET'));
        }
        return responseObservable;
    }

    post(path: string, body: any, options: RequestOptionsArgs = {}, loggingOptions: RequestLoggingOptions = {}): Observable<Response> {
        let responseObservable = this.http.post(`${this.configuration.LoginServerUrl}/${path}`, body, this.addTicket(options));
        if (!loggingOptions.dontLog) {
            this.logger.log(`POST (begin) - ${this.configuration.LoginServerUrl}/${path}`,
                loggingOptions.bodyFilter ? loggingOptions.bodyFilter(body) : body);
            responseObservable = responseObservable.do(this.logResponse('POST'));
        }
        return responseObservable;
    }

    private addTicket(options: RequestOptionsArgs): RequestOptionsArgs {
        const ticket = localStorage.getItem('ticket');
        if (!ticket) {
            return options;
        }
        if (options.headers == undefined) {
            options.headers = new Headers();
        }
        options.headers.set('Authorization', `Basic ${btoa(ticket + ':*')}`);
        return options;
    }

    private logResponse(type: 'GET' | 'POST'): PartialObserver<Response> {
        return {
            next: (response: Response) => this.logger.log(`${type}  (done) - ${response.url} - ${response.statusText}`),
            error: (error: Response) => this.logger.error(`${type} (error) - ${error.url} - ${error.statusText}`)
        };
    }
}
