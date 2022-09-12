import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Logger } from '../../desktop-app/logger';
import { ConfigurationService } from '../configuration.service';
import { LoginTicketService } from '../login-ticket.service';
import { Argv } from '../argv';
import { FormInput } from './form-inputs';
import { FormInputValue, LoginForm } from './login-form';
import { AuthenticationState } from './login-result';
import { LoginService } from './login.service';

@Component({
    selector: 'tc-login',
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, AfterViewInit {

    formInputs: FormInput[];
    submit: FormInput;
    rememberLogin: boolean;
    loginError: string;

    @ViewChild('loginForm', { static: true })
    loginForm: NgForm;

    constructor(
        private loginService: LoginService,
        private loginTicket: LoginTicketService,
        private configuration: ConfigurationService,
        private route: ActivatedRoute,
        private router: Router,
        private changeDetector: ChangeDetectorRef,
        private logger: Logger,
        private argv: Argv) {
    }

    ngOnInit(): void {
        this.formInputs = this.route.snapshot.data['form'].inputs.filter(input => input.type !== 'submit');
        this.submit = this.route.snapshot.data['form'].inputs.find(input => input.type === 'submit');
        this.rememberLogin = this.configuration.RememberLogin;
        // navigating to this component means our stored credentials were not valid, clear them
        this.loginTicket.clear();
        this.logger.log(`Login | Logging in using ${this.formInputs.map(input => input.input_id).join(', ')}`);
    }

    ngAfterViewInit(): void {
        this.loginForm.statusChanges.subscribe(() => this.changeDetector.markForCheck());
    }

    login(): void {
        const form = new LoginForm();
        form.platform_id = this.argv['program_platform'];
        form.program_id = this.argv['program_id'];
        form.version = this.argv['program_version'];
        form.inputs = Object.keys(this.loginForm.value).map(inputId => {
            const value = new FormInputValue();
            value.input_id = inputId;
            value.value = this.loginForm.value[inputId];
            return value;
        });
        this.loginError = undefined;
        // clearing password solves two problems here
        // * saves the user from having to do it manually in case it was wrong
        // * makes the form invalid, disables submit button and prevents spamming requests
        this.formInputs
            .filter(input => input.type === 'password')
            .forEach(input => this.loginForm.controls[input.input_id].reset());
        this.logger.log('Login | Attempting login');
        this.loginService.login(form).subscribe(loginResult => {
            if (loginResult.authentication_state === AuthenticationState.DONE) {
                if (!!loginResult.login_ticket) {
                    this.logger.log('Login | Login successful');
                    this.loginTicket.store(loginResult.login_ticket, this.rememberLogin);
                    this.router.navigate(['/account']);
                } else {
                    this.logger.error('Login | Login failed');
                    if (!!loginResult.error_message) {
                        this.loginError = loginResult.error_message;
                    } else {
                        this.loginError = 'We couldn\'t log you in with what you just entered. Please try again.';
                    }
                }
            } else {
                this.logger.error(`Login | Unsupported authentication state ${loginResult.authentication_state}`);
            }
            this.changeDetector.markForCheck();
        });
    }
}
