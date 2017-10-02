export class GameAccountInfo {
    display_name: string;
    expansion: number;
    is_suspended: boolean;
    is_banned: boolean;
    suspension_expires: number;
    suspension_reason: string;
}

export class GameAccountList {
    game_accounts: GameAccountInfo[];
}
