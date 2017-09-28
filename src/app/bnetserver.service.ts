import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ConfigurationService } from './configuration.service';

@Injectable()
export class BnetserverService {

    constructor(private http: Http, private configuration: ConfigurationService) {
    }

    get(path: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.get(`${this.configuration.LoginServerUrl}/${path}`, this.addTicket(options));
    }

    post(path: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.http.post(`${this.configuration.LoginServerUrl}/${path}`, body, this.addTicket(options));
    }

    private addTicket(options: RequestOptionsArgs): RequestOptionsArgs {
        const ticket = localStorage.getItem('ticket');
        if (!ticket) {
            return options;
        }
        if (options == undefined) {
            options = {};
        }
        if (options.headers == undefined) {
            options.headers = new Headers();
        }
        options.headers.set('Authorization', `Basic ${btoa(ticket + ':*')}`);
        return options;
    }
}
