import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Logger } from '../../electron/logger';
import { FormInputs } from './form-inputs';
import { LoginService } from './login.service';

@Injectable()
export class LoginFormResolver implements Resolve<FormInputs> {

    constructor(
        private loginService: LoginService,
        private router: Router,
        private logger: Logger) {
    }

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FormInputs> {
        this.logger.log('Login | Retrieving login form fields');
        return this.loginService.getForm().pipe(catchError(error => {
            this.logger.error('Login | Failed to retrieve login form!', error);
            this.router.navigate(['/initialization-error']);
            return EMPTY;
        }));
    }
}
