import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';

import { MainComponent } from './main/main.component';

@NgModule({
    declarations: [
        MainComponent
    ],
    imports: [
        BrowserModule,
        NgxElectronModule
    ],
    providers: [],
    bootstrap: [MainComponent]
})
export class AppModule {
}
