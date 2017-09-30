import 'rxjs/add/observable/of';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';


@Component({
    selector: 'tc-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

    constructor(
        private router: Router) {
    }

    ngOnInit() {
        this.getInitialRoute().subscribe(initialRoute => {
            this.router.navigate([initialRoute]);
        });
    }

    private getInitialRoute(): Observable<string> {
        return Observable.of('/login');
    }
}
