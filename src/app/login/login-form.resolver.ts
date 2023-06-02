import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Logger } from '../../desktop-app/logger';
import { FormInputs } from './form-inputs';
import { LoginService } from './login.service';

@Injectable()
export class LoginFormResolver  {

    constructor(
        private loginService: LoginService,
        private router: Router,
        private logger: Logger) {
    }

    public resolve(): Observable<FormInputs> {
        this.logger.log('Login | Retrieving login form fields');
        return this.loginService.getForm().pipe(catchError(error => {
            this.logger.error('Login | Failed to retrieve login form!', error);
            this.router.navigate(['/initialization-error']);
            return EMPTY;
        }));
    }
}
