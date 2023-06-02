import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Logger } from '../desktop-app/logger';

@Injectable()
export class PortalResolver  {

    constructor(
        private http: HttpClient,
        private router: Router,
        private logger: Logger) {
    }

    resolve(): Observable<string> {
        this.logger.log('Portal | Retrieving portal address');
        return this.http.get('portal/', { responseType: 'text' }).pipe(
            catchError(error => {
                this.logger.error('Portal | Failed to portal!', error);
                this.router.navigate(['/portal-error']);
                return EMPTY;
            }));
    }
}
