#include "CDSACrypt.h"
#include <cstdlib>
#include <cstring>

static CSSM_VERSION vers = { 2, 0 };
static CSSM_GUID const testGuid = { 0xFADE, 0, 0, { 1, 2, 3, 4, 5, 6, 7, 0 } };

/*
 * Standard app-level memory functions required by CDSA.
 */
void* appMalloc(CSSM_SIZE size, void* /*allocRef*/)
{
    return malloc(size);
}

void appFree(void* mem_ptr, void* /*allocRef*/)
{
    free(mem_ptr);
}

void* appRealloc(void* ptr, CSSM_SIZE size, void* /*allocRef*/)
{
    return realloc(ptr, size);
}

void* appCalloc(uint32 num, CSSM_SIZE size, void* /*allocRef*/)
{
    return calloc(num, size);
}

static CSSM_API_MEMORY_FUNCS memFuncs =
{
    appMalloc,
    appFree,
    appRealloc,
    appCalloc,
    NULL
};

/*
 * Init CSSM; returns CSSM_FALSE on error. Reusable.
 */
static CSSM_BOOL cssmInitd = CSSM_FALSE;
CSSM_RETURN cssmStartup()
{
    if (cssmInitd)
        return CSSM_OK;

    CSSM_PVC_MODE pvcPolicy = CSSM_PVC_NONE;
    CSSM_RETURN crtn = CSSM_Init(&vers, CSSM_PRIVILEGE_SCOPE_NONE, &testGuid, CSSM_KEY_HIERARCHY_NONE, &pvcPolicy, nullptr);
    if (crtn != CSSM_OK)
        return crtn;

    cssmInitd = CSSM_TRUE;
    return CSSM_OK;
}

/*
 * Initialize CDSA and attach to the CSP.
 */
CSSM_RETURN CDSA::CspAttach(CSSM_CSP_HANDLE* cspHandle)
{
    // initialize CDSA (this is reusable)
    CSSM_RETURN crtn = cssmStartup();
    if (crtn)
        return crtn;

    // Load the CSP bundle into this app's memory space
    crtn = CSSM_ModuleLoad(&gGuidAppleCSP, CSSM_KEY_HIERARCHY_NONE, nullptr, nullptr);
    if (crtn)
        return crtn;

    // obtain a handle which will be used to refer to the CSP
    CSSM_CSP_HANDLE cspHand;
    crtn = CSSM_ModuleAttach(&gGuidAppleCSP, &vers, &memFuncs, 0, CSSM_SERVICE_CSP, 0, CSSM_KEY_HIERARCHY_NONE, nullptr, 0, nullptr, &cspHand);
    if (crtn)
        return crtn;

    *cspHandle = cspHand;
    return CSSM_OK;
}

/*
 * Detach from CSP. To be called when app is finished with this library
 */
CSSM_RETURN CDSA::CspDetach(CSSM_CSP_HANDLE cspHandle)
{
    return CSSM_ModuleDetach(cspHandle);
}

/*
 * Create an encryption context for the specified key
 */
static CSSM_RETURN genCryptHandle(CSSM_CSP_HANDLE cspHandle, CSSM_KEY const* key, CSSM_DATA const* ivPtr, CSSM_CC_HANDLE* ccHandle)
{
    CSSM_CC_HANDLE ccHand = 0;
    CSSM_RETURN crtn = CSSM_CSP_CreateSymmetricContext(cspHandle, key->KeyHeader.AlgorithmId, CSSM_ALGMODE_CBCPadIV8, nullptr, key, ivPtr, CSSM_PADDING_PKCS7, nullptr, &ccHand);
    if (crtn)
        return crtn;

    *ccHandle = ccHand;
    return CSSM_OK;
}

/*
 * Derive a symmetric CSSM_KEY from the specified raw key material.
 */
CSSM_RETURN CDSA::DeriveKey(CSSM_CSP_HANDLE cspHandle, CSSM_DATA rawKey, CSSM_DATA salt, CSSM_ALGORITHMS keyAlg, uint32 keySizeInBits, CSSM_KEY_PTR key)
{
    CSSM_ACCESS_CREDENTIALS creds;
    CSSM_CC_HANDLE ccHand;

    memset(key, 0, sizeof(CSSM_KEY));
    memset(&creds, 0, sizeof(CSSM_ACCESS_CREDENTIALS));
    CSSM_RETURN crtn = CSSM_CSP_CreateDeriveKeyContext(cspHandle, CSSM_ALGID_PKCS5_PBKDF2, keyAlg, keySizeInBits, &creds, nullptr, 1000, &salt, nullptr, &ccHand);
    if (crtn)
        return crtn;

    CSSM_PKCS5_PBKDF2_PARAMS pbeParams;
    pbeParams.Passphrase = rawKey;
    pbeParams.PseudoRandomFunction = CSSM_PKCS5_PBKDF2_PRF_HMAC_SHA1;
    CSSM_DATA pbeData = { sizeof(pbeParams), (uint8*)&pbeParams };
    CSSM_DATA dummyLabel = { 8, (uint8*)"someKey" };

    crtn = CSSM_DeriveKey(ccHand, &pbeData, CSSM_KEYUSE_ANY, CSSM_KEYATTR_RETURN_DATA | CSSM_KEYATTR_EXTRACTABLE, &dummyLabel, nullptr, key);
    CSSM_DeleteContext(ccHand); // ignore error here
    return crtn;
}

/*
 * Free resources allocated in cdsaDeriveKey().
 */
CSSM_RETURN CDSA::FreeKey(CSSM_CSP_HANDLE cspHandle, CSSM_KEY_PTR key)
{
    return CSSM_FreeKey(cspHandle, nullptr, key, CSSM_FALSE);
}

/*
 *  Init vector
 */
static uint8 iv[16] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
static CSSM_DATA const ivCommon = { 16, iv };

/*
 * Encrypt
 */
CSSM_RETURN CDSA::Encrypt(CSSM_CSP_HANDLE cspHandle, CSSM_KEY const* key, CSSM_DATA const* plainText, CSSM_DATA_PTR cipherText)
{
    CSSM_CC_HANDLE ccHandle;
    CSSM_RETURN crtn = genCryptHandle(cspHandle, key, &ivCommon, &ccHandle);
    if (crtn)
        return crtn;

    cipherText->Length = 0;
    cipherText->Data = nullptr;
    CSSM_SIZE bytesEncrypted;
    CSSM_DATA remData = { 0, nullptr };
    crtn = CSSM_EncryptData(ccHandle, plainText, 1, cipherText, 1, &bytesEncrypted, &remData);
    CSSM_DeleteContext(ccHandle);
    if (crtn)
        return crtn;

    cipherText->Length = bytesEncrypted;
    if (remData.Length != 0)
    {
        // append remaining data to cipherText
        uint32 newLen = cipherText->Length + remData.Length;
        cipherText->Data = (uint8*)realloc(cipherText->Data, newLen);
        memmove(cipherText->Data + cipherText->Length, remData.Data, remData.Length);
        cipherText->Length = newLen;
        free(remData.Data);
    }

    return CSSM_OK;
}

/*
 * Decrypt
 */
CSSM_RETURN CDSA::Decrypt(CSSM_CSP_HANDLE cspHandle, CSSM_KEY const* key, CSSM_DATA const* cipherText, CSSM_DATA_PTR plainText)
{
    CSSM_RETURN crtn;
    CSSM_CC_HANDLE ccHandle;
    CSSM_DATA remData = { 0, nullptr };
    CSSM_SIZE bytesDecrypted;

    crtn = genCryptHandle(cspHandle, key, &ivCommon, &ccHandle);
    if (crtn)
        return crtn;

    plainText->Length = 0;
    plainText->Data = nullptr;
    crtn = CSSM_DecryptData(ccHandle, cipherText, 1, plainText, 1, &bytesDecrypted, &remData);
    CSSM_DeleteContext(ccHandle);
    if (crtn)
        return crtn;

    plainText->Length = bytesDecrypted;
    if (remData.Length != 0)
    {
        // append remaining data to plainText
        uint32 newLen = plainText->Length + remData.Length;
        plainText->Data = (uint8*)realloc(plainText->Data, newLen);
        memmove(plainText->Data + plainText->Length, remData.Data, remData.Length);
        plainText->Length = newLen;
        free(remData.Data);
    }

    return CSSM_OK;
}
