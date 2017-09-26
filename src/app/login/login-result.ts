export enum AuthenticationState {
    LOGIN = <any>'LOGIN',
    LEGAL = <any>'LEGAL',
    AUTHENTICATOR = <any>'AUTHENTICATOR',
    DONE = <any>'DONE'
}

export class LoginResult {
    authentication_state: AuthenticationState;
    error_code: string;
    error_message: string;
    url: string;
    login_ticket: string;
}
