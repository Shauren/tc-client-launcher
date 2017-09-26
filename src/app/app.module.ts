import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';

import { BnetserverService } from './bnetserver.service';
import { ConfigurationService } from './configuration.service';
import { MainComponent } from './main/main.component';
import { routes } from './routes';

@NgModule({
    declarations: [
        MainComponent
    ],
    imports: [
        HttpModule,
        BrowserModule,
        RouterModule.forRoot(routes),
        NgxElectronModule
    ],
    providers: [
        ConfigurationService,
        BnetserverService,
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
