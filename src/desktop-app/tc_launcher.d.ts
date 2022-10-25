interface Launcher {
    launchGame(gameInstallDir: string, portal: string, loginTicket: string, gameAccount: string, version: string): boolean;
    encryptString(inputString: string): Buffer;
    decryptString(encryptedString: Buffer): string;
}
