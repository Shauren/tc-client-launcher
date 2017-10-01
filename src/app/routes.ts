import { Routes } from '@angular/router';

import { ErrorComponent } from './error/error.component';
import { LoaderComponent } from './loader/loader.component';
import { LoginFormResolver } from './login/login-form.resolver';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: LoaderComponent },
    { path: 'login', component: LoginComponent, resolve: { form: LoginFormResolver } },
    { path: 'initialization-error', component: ErrorComponent, data: { code: 'TCL001' } },
    { path: '**', component: ErrorComponent, data: { code: 'TCL404' } }
];
