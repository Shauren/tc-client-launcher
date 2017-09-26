import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';

import { ConfigurationService } from './configuration.service';
import { MainComponent } from './main/main.component';
import { routes } from './routes';

@NgModule({
    declarations: [
        MainComponent
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot(routes),
        NgxElectronModule
    ],
    providers: [
        ConfigurationService,
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
