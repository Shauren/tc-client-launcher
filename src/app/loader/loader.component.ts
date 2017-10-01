import 'rxjs/add/observable/of';

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';


@Component({
    selector: 'tc-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent implements OnInit {

    constructor(
        private router: Router) {
    }

    ngOnInit() {
        this.getInitialRoute().subscribe(initialRoute => {
            this.logger.log(`Loader | Resolved initial route to ${initialRoute}`);
            this.router.navigate([initialRoute]);
        });
    }

    private getInitialRoute(): Observable<string> {
        return Observable.of('/login');
    }
}
