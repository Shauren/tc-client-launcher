import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'tc-error',
    templateUrl: './error.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent {

    constructor(private route: ActivatedRoute) {
    }

    getErrorCode(): string {
        return this.route.snapshot.data['code'];
    }

    getErrorMessage(): string {
        switch (this.getErrorCode()) {
            case 'TCL001':
                return `Failed to initialize login form, check if your 'Login URL' setting is correct and the server is running.`;
            case 'TCL404':
                return 'Unexpected component navigation error.';
            default:
                break;
        }
        return 'Unexpected error';
    }
}
