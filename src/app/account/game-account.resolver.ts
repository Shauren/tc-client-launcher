import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Logger } from '../../desktop-app/logger';
import { AccountService } from './account.service';
import { GameAccountList } from './game-account-info';

@Injectable()
export class GameAccountResolver implements Resolve<GameAccountList> {

    constructor(
        private accountService: AccountService,
        private logger: Logger) {
    }

    resolve(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GameAccountList> {
        this.logger.log('Account | Retrieving game account list');
        return this.accountService.getGameAccounts().pipe(catchError(error => {
            this.logger.error('Account | Failed to retrieve game account list!', error);
            return of<GameAccountList>({ game_accounts: [] });
        }));
    }
}
