interface Launcher {
    launchGame(gameInstallDir: string, use64Bit: boolean, portal: string, loginTicket: string, gameAccount: string): boolean;
}
