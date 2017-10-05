
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

bool StoreLoginTicket(char const* portal, char const* loginTicket, char const* gameAccount)
{
    HKEY launcherKey;
    if (RegCreateKeyExA(HKEY_CURRENT_USER, R"(Software\TrinityCore Developers\Battle.net\Launch Options\WoW)", 0, nullptr, 0, KEY_WRITE, nullptr, &launcherKey, nullptr) != ERROR_SUCCESS)
        return false;

    std::unique_ptr<HKEY, RegCloseKeyDeleter> handle(launcherKey);

    if (RegSetValueExA(launcherKey, PORTAL_ADDRESS, 0, REG_SZ, reinterpret_cast<BYTE const*>(portal), strlen(portal) + 1) != ERROR_SUCCESS)
        return false;

    if (RegSetValueExA(launcherKey, GAME_ACCOUNT_NAME, 0, REG_SZ, reinterpret_cast<BYTE const*>(gameAccount), strlen(gameAccount) + 1) != ERROR_SUCCESS)
        return false;

    DATA_BLOB ticketInput{ (DWORD)strlen(loginTicket), (BYTE*)loginTicket };
    DATA_BLOB entropy{ std::extent_v<decltype(Entropy)>, (BYTE*)Entropy };
    DATA_BLOB ticketOutput{};

    if (!CryptProtectData(&ticketInput, L"TcLauncher", &entropy, nullptr, nullptr, CRYPTPROTECT_UI_FORBIDDEN, &ticketOutput))
        return false;

    std::unique_ptr<HLOCAL, LocalFreeDeleter> output(ticketOutput.pbData);

    if (RegSetValueExA(launcherKey, LOGIN_TICKET, 0, REG_BINARY, ticketOutput.pbData, ticketOutput.cbData) != ERROR_SUCCESS)
        return false;

    return true;
}

bool LaunchGameWithLogin(char const* gameInstallDir, bool use64Bit)
{
    char commandLine[32768] = {};
    strcat(commandLine, gameInstallDir);
    strcat(commandLine, "\\");
    strcat(commandLine, use64Bit ? "Wow-64_Patched.exe" : "Wow_Patched.exe");
    strcat(commandLine, " -launcherlogin -noautolaunch64bit");

    STARTUPINFOA startupInfo{sizeof(STARTUPINFOA)};
    PROCESS_INFORMATION processInfo;
    if (!CreateProcessA(nullptr, commandLine, nullptr, nullptr, FALSE, 0, nullptr, gameInstallDir, &startupInfo, &processInfo))
        return false;

    CloseHandle(processInfo.hProcess);
    CloseHandle(processInfo.hThread);
    return true;
}
