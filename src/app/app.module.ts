import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';

import { BnetserverService } from './bnetserver.service';
import { ConfigurationService } from './configuration.service';
import { LoaderComponent } from './loader/loader.component';
import { LoginTicketService } from './login-ticket.service';
import { LoginFormResolver } from './login/login-form.resolver';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { MainComponent } from './main/main.component';
import { routes } from './routes';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';

@NgModule({
    declarations: [
        LoaderComponent,
        LoginComponent,
        MainComponent,
        SettingsDialogComponent
    ],
    imports: [
        FormsModule,
        HttpModule,
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        NgxElectronModule
    ],
    providers: [
        ConfigurationService,
        BnetserverService,
        LoginService,
        LoginFormResolver,
        LoginTicketService,
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
