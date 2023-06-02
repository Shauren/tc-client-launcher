import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { AccountComponent } from './account/account.component';
import { GameAccountResolver } from './account/game-account.resolver';
import { ErrorComponent } from './error/error.component';
import { LoaderComponent } from './loader/loader.component';
import { LoginFormResolver } from './login/login-form.resolver';
import { LoginComponent } from './login/login.component';
import { PortalResolver } from './portal-resolver';

export const routes: Routes = [
    { path: '', pathMatch: 'full', component: LoaderComponent },
    {
        path: 'login',
        component: LoginComponent,
        resolve: {
            form: () => inject(LoginFormResolver).resolve()
        }
    },
    {
        path: 'account',
        component: AccountComponent,
        resolve: {
            gameAccounts: () => inject(GameAccountResolver).resolve(),
            portal: () => inject(PortalResolver).resolve()
        }
    },
    { path: 'initialization-error', component: ErrorComponent, data: { code: 'TCL001' } },
    { path: 'portal-error', component: ErrorComponent, data: { code: 'TCL002' } },
    { path: '**', component: ErrorComponent, data: { code: 'TCL404' } }
];
