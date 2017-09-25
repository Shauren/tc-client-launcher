import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';

import { ConfigurationService } from './configuration.service';
import { MainComponent } from './main/main.component';

@NgModule({
    declarations: [
        MainComponent
    ],
    imports: [
        BrowserModule,
        NgxElectronModule
    ],
    providers: [
        ConfigurationService,
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
