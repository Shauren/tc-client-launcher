#include <iostream>
#include <vector>
#include "CDSACrypt.h"
#include "LauncherShared.h"

bool ProcessData(CSSM_DATA_PTR inData, CSSM_DATA_PTR outData, bool encrypt)
{
    CSSM_CSP_HANDLE cspHandle;
    CSSM_KEY        cdsaKey;
    CSSM_DATA       salt = {8, (uint8*)"someSalt"};

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

    if (encrypt)
        crtn = cdsaEncrypt(cspHandle, &cdsaKey, inData, outData);
    else
        crtn = cdsaDecrypt(cspHandle, &cdsaKey, inData, outData);

    if(crtn)
        return false;

    // Free resources
    cdsaFreeKey(cspHandle, &cdsaKey);
    cdsaCspDetach(cspHandle);
    return true;
}

bool EncryptString(char const* string, std::vector<uint8_t>* output)
{
    output->clear();

    CSSM_DATA       inData = {strlen(string), (uint8*)string};
    CSSM_DATA       encryptedData = {0, NULL};

    if (!ProcessData(&inData, &encryptedData, true))
        return false;

    std::copy(encryptedData.Data[0], encryptedData.Data[encryptedData.Length], std::back_inserter(*output));

    free(encryptedData.Data);
    return true;
}

bool DecryptString(std::vector<uint8_t> const& encryptedString, std::string* output)
{
    output->clear();

    CSSM_DATA       inData = {encryptedString.size(), (uint8*)encryptedString.data()};
    CSSM_DATA       plainData = {0, NULL};

    if (!ProcessData(&inData, &plainData, false))
        return false;

    output->assign(reinterpret_cast<char const*>(plainData.Data), plainData.Length);

    free(plainData.Data);
    return true;
}

bool StoreLoginTicket(char const* portal, char const* loginTicket, char const* gameAccount)
{
    std::vector<uint8_t> encryptedTicket;
    if (!EncryptString(loginTicket, &encryptedTicket))
        return false;

    CFStringRef app = CFSTR("org.trnity");
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/WEB_TOKEN"), CFDataCreate(NULL, encryptedTicket.data(), encryptedTicket.size()), app);
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/GAME_ACCOUNT"), CFStringCreateWithCString(NULL, gameAccount, kCFStringEncodingUTF8), app);
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/CONNECTION_STRING"), CFStringCreateWithCString(NULL, portal, kCFStringEncodingUTF8), app);
    CFPreferencesAppSynchronize(app);

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
