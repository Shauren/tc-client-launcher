import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { Logger } from '../desktop-app/logger';
import { AccountComponent } from './account/account.component';
import { AccountService } from './account/account.service';
import { GameAccountResolver } from './account/game-account.resolver';
import { Argv, argvFactory } from './argv';
import { AuthHttpInterceptor } from './auth-http-interceptor';
import { BnetserverUrlHttpInterceptor } from './bnetserver-url-http-interceptor';
import { ConfigurationService } from './configuration.service';
import { ErrorComponent } from './error/error.component';
import { LoaderComponent } from './loader/loader.component';
import { LoggingHttpInterceptor } from './logging-http-interceptor';
import { LoginTicketService } from './login-ticket.service';
import { LoginFormResolver } from './login/login-form.resolver';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { MainComponent } from './main/main.component';
import { PortalResolver } from './portal-resolver';
import { RendererLogger } from './renderer-logger';
import { routes } from './routes';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

@NgModule({
    declarations: [
        AccountComponent,
        ErrorComponent,
        LoaderComponent,
        LoginComponent,
        MainComponent,
        SettingsDialogComponent
    ],
    imports: [
        FormsModule,
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: BnetserverUrlHttpInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LoggingHttpInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
        { provide: Argv, useFactory: argvFactory },
        { provide: Logger, useClass: RendererLogger },
        ConfigurationService,
        LoginService,
        LoginFormResolver,
        LoginTicketService,
        AccountService,
        GameAccountResolver,
        PortalResolver
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
