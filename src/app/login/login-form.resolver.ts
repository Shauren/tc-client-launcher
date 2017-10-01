import 'rxjs/add/observable/empty';

import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { Logger } from '../../electron/logger';
import { FormInputs } from './form-inputs';
import { LoginService } from './login.service';

export class LoginFormResolver implements Resolve<FormInputs> {

    constructor(
        private loginService: LoginService,
        private router: Router,
        private logger: Logger) {
    }

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FormInputs> {
        this.logger.log('Login | Retrieving login form fields...');
        return this.loginService.getForm().catch(() => {
            this.logger.error('Login | Failed to retrieve login form!');
            return Observable.empty<FormInputs>();
        });
    }
}
