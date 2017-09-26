import { Routes } from '@angular/router';

import { LoginFormResolver } from './login/login-form.resolver';
import { LoginComponent } from './login/login.component';
export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
        children: []
    },
    {
        path: 'login',
        component: LoginComponent,
        resolve: {
            form: LoginFormResolver
        }
    }
];
