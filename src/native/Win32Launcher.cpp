
#include "LauncherShared.h"

#include <memory>
#include <sstream>
#include <string>

#include <Windows.h>
#include <dpapi.h>

#define UNIQUE_DELETER(type, deleter)                     \
    struct deleter##Deleter                               \
    {                                                     \
        using pointer = type;                             \
        void operator()(type handle) { deleter(handle); } \
    };

UNIQUE_DELETER(HKEY, RegCloseKey)
UNIQUE_DELETER(HLOCAL, LocalFree)

bool EncryptString(char const* string, std::vector<uint8_t>* output)
{
    output->clear();

    DATA_BLOB inputBlob{ (DWORD)strlen(string), (BYTE*)string };
    DATA_BLOB entropy{ std::extent_v<decltype(Entropy)>, (BYTE*)Entropy };
    DATA_BLOB outputBlob{};

    if (!CryptProtectData(&inputBlob, L"TcLauncher", &entropy, nullptr, nullptr, CRYPTPROTECT_UI_FORBIDDEN, &outputBlob))
        return false;

    std::unique_ptr<HLOCAL, LocalFreeDeleter> outputDeleter(outputBlob.pbData);
    std::copy(outputBlob.pbData, outputBlob.pbData + outputBlob.cbData, std::back_inserter(*output));
    return true;
}

bool DecryptString(std::vector<uint8_t> const& encryptedString, std::string* output)
{
    output->clear();

    DATA_BLOB inputBlob{ (DWORD)encryptedString.size(), (BYTE*)encryptedString.data() };
    DATA_BLOB entropy{ std::extent_v<decltype(Entropy)>, (BYTE*)Entropy };
    DATA_BLOB outpubBlob{};

    if (!CryptUnprotectData(&inputBlob, nullptr, &entropy, nullptr, nullptr, CRYPTPROTECT_UI_FORBIDDEN, &outpubBlob))
        return false;

    std::unique_ptr<HLOCAL, LocalFreeDeleter> outputDeleter(outpubBlob.pbData);
    output->assign(reinterpret_cast<char const*>(outpubBlob.pbData), outpubBlob.cbData);
    return true;
}

bool StoreLoginTicket(char const* portal, char const* loginTicket, char const* gameAccount)
{
    HKEY launcherKey;
    if (RegCreateKeyExA(HKEY_CURRENT_USER, R"(Software\Custom Game Server Dev\Battle.net\Launch Options\WoW)", 0, nullptr, 0, KEY_WRITE, nullptr, &launcherKey, nullptr) != ERROR_SUCCESS)
        return false;

    std::unique_ptr<HKEY, RegCloseKeyDeleter> handle(launcherKey);

    if (RegSetValueExA(launcherKey, PORTAL_ADDRESS, 0, REG_SZ, reinterpret_cast<BYTE const*>(portal), strlen(portal) + 1) != ERROR_SUCCESS)
        return false;

    if (RegSetValueExA(launcherKey, GAME_ACCOUNT_NAME, 0, REG_SZ, reinterpret_cast<BYTE const*>(gameAccount), strlen(gameAccount) + 1) != ERROR_SUCCESS)
        return false;

    std::vector<uint8_t> encryptedTicket;
    if (!EncryptString(loginTicket, &encryptedTicket))
        return false;

    if (RegSetValueExA(launcherKey, LOGIN_TICKET, 0, REG_BINARY, encryptedTicket.data(), encryptedTicket.size()) != ERROR_SUCCESS)
        return false;

    return true;
}

bool LaunchGameWithLogin(char const* gameInstallDir)
{
    char commandLine[32768] = {};
    strcat(commandLine, gameInstallDir);
    strcat(commandLine, "\\");
    strcat(commandLine, R"("Arctium WoW Launcher.exe")");
    strcat(commandLine, " -launcherlogin -Config Config2.wtf");

    STARTUPINFOA startupInfo{sizeof(STARTUPINFOA)};
    PROCESS_INFORMATION processInfo;
    if (!CreateProcessA(nullptr, commandLine, nullptr, nullptr, FALSE, 0, nullptr, gameInstallDir, &startupInfo, &processInfo))
        return false;

    CloseHandle(processInfo.hProcess);
    CloseHandle(processInfo.hThread);
    return true;
}
