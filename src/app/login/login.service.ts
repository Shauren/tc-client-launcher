import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { BnetserverService } from '../bnetserver.service';
import { FormInputs } from './form-inputs';
import { LoginForm } from './login-form';
import { LoginResult } from './login-result';

@Injectable()
export class LoginService {

    constructor(private http: BnetserverService) {
    }

    getForm(): Observable<FormInputs> {
        return this.http.get('login/').map(response => response.json());
    }

    login(form: LoginForm): Observable<LoginResult> {
        return this.http.post('login/', form).map(response => response.json());
    }
}
