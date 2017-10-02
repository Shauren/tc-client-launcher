import 'rxjs/add/observable/empty';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { Logger } from '../electron/logger';

@Injectable()
export class PortalResolver implements Resolve<string> {

    constructor(
        private http: HttpClient,
        private router: Router,
        private logger: Logger) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> {
        this.logger.log('Portal | Retrieving portal address');
        return this.http.get('portal/', { responseType: 'text' })
            .catch(error => {
                this.logger.error('Portal | Failed to portal!', error);
                this.router.navigate(['/portal-error']);
                return Observable.empty<string>();
            });
    }
}
