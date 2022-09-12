#include "CDSACrypt.h"
#include "LauncherShared.h"
#include <string>
#include <CoreFoundation/CFPreferences.h>

bool ProcessData(CSSM_DATA_PTR inData, CSSM_DATA_PTR outData, bool encrypt)
{
    // Initialize CDSA
    CSSM_CSP_HANDLE cspHandle;
    CSSM_RETURN crtn = CDSA::CspAttach(&cspHandle);
    if (crtn)
        return false;

    // Create encryption password
    char const* username = getenv("USER");
    uint8 xorLength = std::min(strlen(username), size_t(16));

    uint8 rawPassword[16];
    std::copy(std::begin(Entropy), std::end(Entropy), std::begin(rawPassword));
    for (uint8 i = 0; i < xorLength; i++)
        rawPassword[i] ^= username[i];

    CSSM_DATA password = { 16, rawPassword };

    // Create encryption key
    CSSM_DATA salt = { 8, (uint8*)"someSalt" };
    CSSM_KEY cdsaKey;
    crtn = CDSA::DeriveKey(cspHandle, password, salt, CSSM_ALGID_AES, 128, &cdsaKey);
    if (crtn)
    {
        CDSA::CspDetach(cspHandle);
        return false;
    }

    if (encrypt)
        crtn = CDSA::Encrypt(cspHandle, &cdsaKey, inData, outData);
    else
        crtn = CDSA::Decrypt(cspHandle, &cdsaKey, inData, outData);

    // Free resources
    CDSA::FreeKey(cspHandle, &cdsaKey);
    CDSA::CspDetach(cspHandle);
    return !crtn;
}

bool EncryptString(char const* string, std::vector<uint8_t>* output)
{
    output->clear();

    CSSM_DATA inData = { strlen(string), (uint8*)string };
    CSSM_DATA encryptedData = { 0, nullptr };

    if (!ProcessData(&inData, &encryptedData, true))
        return false;

    std::copy(encryptedData.Data, encryptedData.Data + encryptedData.Length, std::back_inserter(*output));

    free(encryptedData.Data);
    return true;
}

bool DecryptString(std::vector<uint8_t> const& encryptedString, std::string* output)
{
    output->clear();

    CSSM_DATA inData = { encryptedString.size(), (uint8*)encryptedString.data() };
    CSSM_DATA plainData = { 0, nullptr };

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
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/" LOGIN_TICKET), CFDataCreate(nullptr, encryptedTicket.data(), encryptedTicket.size()), app);
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/" GAME_ACCOUNT_NAME), CFStringCreateWithCString(nullptr, gameAccount, kCFStringEncodingUTF8), app);
    CFPreferencesSetAppValue(CFSTR("Launch Options/WoW/" PORTAL_ADDRESS), CFStringCreateWithCString(nullptr, portal, kCFStringEncodingUTF8), app);
    CFPreferencesAppSynchronize(app);

    return true;
}

bool LaunchGameWithLogin(char const* gameInstallDir)
{
    char commandLine[32768] = {};
    strcat(commandLine, "open \"");
    strcat(commandLine, gameInstallDir);
    strcat(commandLine, "/World of Warcraft Patched.app\"");
    strcat(commandLine, " --args -launcherlogin -console");
    system(commandLine);
    return true;
}
