import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GameAccountList } from './game-account-info';

@Injectable()
export class AccountService {

    constructor(private http: HttpClient) {
    }

    getGameAccounts(): Observable<GameAccountList> {
        return this.http.get<GameAccountList>('gameAccounts/');
    }
}
