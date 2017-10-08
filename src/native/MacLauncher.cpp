#include <iostream>
#include "CDSACrypt.h"
#include "LauncherShared.h"

bool Encrypt(char const* plainData, CSSM_DATA_PTR encryptedData)
{
    CSSM_CSP_HANDLE cspHandle;
    CSSM_KEY        cdsaKey;
    CSSM_DATA       salt = {8, (uint8*)"someSalt"};
    CSSM_DATA       inData = {strlen(plainData), (uint8*)plainData};
    
    // Create encryption password
    char const* username = getenv("USER");
    uint8 xorLength = std::min(strlen(username), size_t(16));
    
    uint8 rawPassword[16];
    std::copy(std::begin(Entropy), std::end(Entropy), std::begin(rawPassword));
    for (int i = 0; i < xorLength; i++)
        rawPassword[i] ^= username[i];
    CSSM_DATA password = {16, rawPassword};
    
    // Initialize CDSA
    CSSM_RETURN crtn = cdsaCspAttach(&cspHandle);
    if(crtn)
        return false;

    // Create encryption key
    crtn = cdsaDeriveKey(cspHandle, password, salt, CSSM_ALGID_AES, 128, &cdsaKey);
    if(crtn)
        return false;

    // Encrypt
    crtn = cdsaEncrypt(cspHandle, &cdsaKey, &inData, encryptedData);
    if(crtn)
        return false;

    // Free resources
    cdsaFreeKey(cspHandle, &cdsaKey);
    cdsaCspDetach(cspHandle);
    return true;
}

bool StoreLoginTicket(char const* portal, char const* loginTicket, char const* gameAccount)
{
    CSSM_DATA encryptedTicket = {0, NULL};
    if (!Encrypt(loginTicket, &encryptedTicket))
        return false;
    
    CFStringRef app = CFSTR("org.trnity");
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/WEB_TOKEN"), CFDataCreate(NULL, encryptedTicket.Data, encryptedTicket.Length), app);
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/GAME_ACCOUNT"), CFStringCreateWithCString(NULL, gameAccount, kCFStringEncodingUTF8), app);
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/CONNECTION_STRING"), CFStringCreateWithCString(NULL, portal, kCFStringEncodingUTF8), app);
    CFPreferencesAppSynchronize(app);

    free(encryptedTicket.Data);
    return true;
}

bool LaunchGameWithLogin(char const* gameInstallDir, bool /*use64Bit*/)
{
    char commandLine[32768] = {};
    strcat(commandLine, "open \"");
    strcat(commandLine, gameInstallDir);
    strcat(commandLine, "/World of Warcraft Patched.app\"");
    strcat(commandLine, " --args -launcherlogin -console");
    system(commandLine);
    return true;
}
