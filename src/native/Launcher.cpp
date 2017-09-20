#include <node.h>

#include <memory>
#include <sstream>
#include <string>

#define WIN32_LEAN_AND_MEAN
#include <Windows.h>
#include <dpapi.h>

#define UNIQUE_DELETER(type, deleter)                     \
    struct type##Deleter                                  \
    {                                                     \
        using pointer = type;                             \
        void operator()(type handle) { deleter(handle); } \
    };

UNIQUE_DELETER(HKEY, RegCloseKey)
UNIQUE_DELETER(HLOCAL, LocalFree)

static constexpr uint8_t Entropy[] = {0xC8, 0x76, 0xF4, 0xAE, 0x4C, 0x95, 0x2E, 0xFE, 0xF2, 0xFA, 0x0F, 0x54, 0x19, 0xC0, 0x9C, 0x43};

bool StoreLoginTicket(char const *portal, char const *loginTicket, char const *gameAccount)
{
    HKEY launcherKey;
    if (RegCreateKeyExA(HKEY_CURRENT_USER, R"(Software\TrinityCore Developers\Battle.net\Launch Options\WoW)", 0, nullptr, 0, KEY_WRITE, nullptr, &launcherKey, nullptr) != ERROR_SUCCESS)
        return false;

    std::unique_ptr<HKEY, HKEYDeleter> handle(launcherKey);

    if (RegSetValueExA(launcherKey, "CONNECTION_STRING", 0, REG_SZ, reinterpret_cast<BYTE const *>(portal), strlen(portal) + 1) != ERROR_SUCCESS)
        return false;

    if (RegSetValueExA(launcherKey, "GAME_ACCOUNT", 0, REG_SZ, reinterpret_cast<BYTE const *>(gameAccount), strlen(gameAccount) + 1) != ERROR_SUCCESS)
        return false;

    DATA_BLOB ticketInput{(DWORD)strlen(loginTicket), (BYTE *)loginTicket};
    DATA_BLOB entropy{std::extent_v<decltype(Entropy)>, (BYTE *)Entropy};
    DATA_BLOB ticketOutput{};

    if (!CryptProtectData(&ticketInput, L"TcLauncher", &entropy, nullptr, nullptr, CRYPTPROTECT_UI_FORBIDDEN, &ticketOutput))
        return false;

    std::unique_ptr<HLOCAL, HLOCALDeleter> output(ticketOutput.pbData);

    if (RegSetValueExA(launcherKey, "WEB_TOKEN", 0, REG_BINARY, ticketOutput.pbData, ticketOutput.cbData) != ERROR_SUCCESS)
        return false;

    return true;
}

bool LaunchGameWithLogin(char const *gameInstallDir, bool use64Bit)
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

void LaunchGame(v8::FunctionCallbackInfo<v8::Value> const &args)
{
    v8::Isolate *isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (args.Length() < 5)
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong number of arguments")));
        return;
    }

    if (!args[0]->IsString() || !args[1]->IsBoolean() || !args[2]->IsString() || !args[3]->IsString() || !args[4]->IsString())
    {
        isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, "Wrong arguments typess")));
        return;
    }

    v8::String::Utf8Value gameInstallDir(args[0]->ToString(isolate));
    bool use64Bit = args[1]->BooleanValue();
    v8::String::Utf8Value portal(args[2]->ToString(isolate));
    v8::String::Utf8Value loginTicket(args[3]->ToString(isolate));
    v8::String::Utf8Value gameAccount(args[4]->ToString(isolate));

    bool success = false;
    if (StoreLoginTicket(*portal, *loginTicket, *gameAccount))
        if (LaunchGameWithLogin(*gameInstallDir, use64Bit))
            success = true;

    args.GetReturnValue().Set(v8::Boolean::New(isolate, success));
}

void Init(v8::Handle<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "launchGame", LaunchGame);
}

NODE_MODULE(tc_launcher, Init)
