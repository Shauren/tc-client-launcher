import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';

import { BnetserverService } from './bnetserver.service';
import { ConfigurationService } from './configuration.service';
import { LoginFormResolver } from './login/login-form.resolver';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login/login.service';
import { MainComponent } from './main/main.component';
import { routes } from './routes';

@NgModule({
    declarations: [
        LoginComponent,
        MainComponent
    ],
    imports: [
        FormsModule,
        HttpModule,
        BrowserModule,
        RouterModule.forRoot(routes),
        NgxElectronModule
    ],
    providers: [
        ConfigurationService,
        BnetserverService,
        LoginService,
        LoginFormResolver,
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
