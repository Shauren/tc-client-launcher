
#ifndef LauncherShared_h__
#define LauncherShared_h__

#include <vector>
#include <cstdint>

bool EncryptString(char const* string, std::vector<uint8_t>* output);
bool DecryptString(std::vector<uint8_t> const& encryptedString, std::string* output);
bool StoreLoginTicket(char const* portal, char const* loginTicket, char const* gameAccount);
bool LaunchGameWithLogin(char const* gameInstallDir);

// unencrypted keys
#define PORTAL_ADDRESS "CONNECTION_STRING"
#define GAME_ACCOUNT_NAME "GAME_ACCOUNT"

// encrypted keys
#define LOGIN_TICKET "WEB_TOKEN"

static constexpr uint8_t Entropy[] = { 0xC8, 0x76, 0xF4, 0xAE, 0x4C, 0x95, 0x2E, 0xFE, 0xF2, 0xFA, 0x0F, 0x54, 0x19, 0xC0, 0x9C, 0x43 };

#endif // LauncherShared_h__
