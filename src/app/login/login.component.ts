import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

import { FormInput } from './form-inputs';
import { FormInputValue, LoginForm } from './login-form';
import { AuthenticationState } from './login-result';
import { LoginService } from './login.service';

@Component({
    selector: 'tc-login',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

    formInputs: FormInput[];
    submit: FormInput;
    loginError: string;

    @ViewChild('loginForm')
    loginForm: NgForm;

    constructor(
        private loginService: LoginService,
        private electron: ElectronService,
        private route: ActivatedRoute,
        private router: Router) {
    }

    ngOnInit(): void {
        this.formInputs = this.route.snapshot.data['form'].inputs.filter(input => input.type !== 'submit');
        this.submit = this.route.snapshot.data['form'].inputs.find(input => input.type === 'submit');
    }

    login(): void {
        const form = new LoginForm();
        form.platform_id = this.electron.process.platform;
        form.program_id = this.electron.remote.app.getName();
        form.version = this.electron.remote.app.getVersion();
        form.inputs = Object.keys(this.loginForm.value).map(inputId => {
            const value = new FormInputValue();
            value.input_id = inputId;
            value.value = this.loginForm.value[inputId];
            return value;
        });
        this.loginError = undefined;
        this.loginService.login(form).subscribe(loginResult => {
            if (loginResult.authentication_state === AuthenticationState.DONE) {
                if (!!loginResult.login_ticket) {
                } else if (!!loginResult.error_message) {
                    this.loginError = loginResult.error_message;
                } else {
                    this.loginError = 'We couldn\'t log you in with what you just entered. Please try again.';
                }
            }
        });
    }
}
