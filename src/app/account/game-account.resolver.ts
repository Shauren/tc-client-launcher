import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { Logger } from '../../electron/logger';
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
        return this.accountService.getGameAccounts().catch(error => {
            this.logger.error('Account | Failed to retrieve game account list!', error);
            return Observable.of<GameAccountList>({ game_accounts: [] });
        });
    }
}
