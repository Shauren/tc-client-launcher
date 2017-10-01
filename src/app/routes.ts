import { Routes } from '@angular/router';

import { LoaderComponent } from './loader/loader.component';
import { LoginFormResolver } from './login/login-form.resolver';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: LoaderComponent },
    { path: 'login', component: LoginComponent, resolve: { form: LoginFormResolver } },
];
