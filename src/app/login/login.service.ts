import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FormInputs } from './form-inputs';
import { LoginForm } from './login-form';
import { LoginResult } from './login-result';

@Injectable()
export class LoginService {

    constructor(private http: HttpClient) {
    }

    getForm(): Observable<FormInputs> {
        return this.http.get<FormInputs>('login/');
    }

    login(form: LoginForm): Observable<LoginResult> {
        return this.http.post<LoginResult>('login/', form);
    }
}
