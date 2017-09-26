import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { FormInputs } from './form-inputs';
import { LoginService } from './login.service';

export class LoginFormResolver implements Resolve<FormInputs> {

    constructor(
        private loginService: LoginService,
        private router: Router) {
    }

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FormInputs> {
        return this.loginService.getForm().catch(() => {
            return Observable.empty<FormInputs>();
        });
    }
}
