#include "CDSACrypt.h"
#include <stdlib.h>
#include <stdio.h>
#include <strings.h>

static CSSM_VERSION vers = {2, 0};
static const CSSM_GUID testGuid = { 0xFADE, 0, 0, { 1,2,3,4,5,6,7,0 }};

/*
 * Standard app-level memory functions required by CDSA.
 */
void * appMalloc (CSSM_SIZE size, void *allocRef) {
    return( malloc(size) );
}
void appFree (void *mem_ptr, void *allocRef) {
    free(mem_ptr);
    return;
}
void * appRealloc (void *ptr, CSSM_SIZE size, void *allocRef) {
    return( realloc( ptr, size ) );
}
void * appCalloc (uint32 num, CSSM_SIZE size, void *allocRef) {
    return( calloc( num, size ) );
}
static CSSM_API_MEMORY_FUNCS memFuncs = {
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
    if(cssmInitd) {
        return CSSM_OK;
    }
    
    CSSM_PVC_MODE pvcPolicy = CSSM_PVC_NONE;
    CSSM_RETURN crtn = CSSM_Init (&vers,
                                  CSSM_PRIVILEGE_SCOPE_NONE,
                                  &testGuid,
                                  CSSM_KEY_HIERARCHY_NONE,
                                  &pvcPolicy,
                                  NULL /* reserved */);
    if(crtn != CSSM_OK) {
        return crtn;
    }
    else {
        cssmInitd = CSSM_TRUE;
        return CSSM_OK;
    }
}

/*
 * Initialize CDSA and attach to the CSP.
 */
CSSM_RETURN cdsaCspAttach(CSSM_CSP_HANDLE *cspHandle)
{
    CSSM_CSP_HANDLE cspHand;
    
    /* initialize CDSA (this is reusable) */
    CSSM_RETURN crtn = cssmStartup();
    if(crtn) {
        return crtn;
    }
    
    /* Load the CSP bundle into this app's memory space */
    crtn = CSSM_ModuleLoad(&gGuidAppleCSP,
                           CSSM_KEY_HIERARCHY_NONE,
                           NULL,            // eventHandler
                           NULL);            // AppNotifyCallbackCtx
    if(crtn) {
        return crtn;
    }
    
    /* obtain a handle which will be used to refer to the CSP */
    crtn = CSSM_ModuleAttach (&gGuidAppleCSP,
                              &vers,
                              &memFuncs,            // memFuncs
                              0,                    // SubserviceID
                              CSSM_SERVICE_CSP,
                              0,                    // AttachFlags
                              CSSM_KEY_HIERARCHY_NONE,
                              NULL,                // FunctionTable
                              0,                    // NumFuncTable
                              NULL,                // reserved
                              &cspHand);
    if(crtn) {
        return crtn;
    }
    *cspHandle = cspHand;
    return CSSM_OK;
}

/*
 * Detach from CSP. To be called when app is finished with this library
 */
CSSM_RETURN cdsaCspDetach(CSSM_CSP_HANDLE cspHandle)
{
    return CSSM_ModuleDetach(cspHandle);
}

/*
 * Derive a symmetric CSSM_KEY from the specified raw key material.
 */
CSSM_RETURN cdsaDeriveKey(CSSM_CSP_HANDLE cspHandle, CSSM_DATA rawKey, CSSM_DATA salt, CSSM_ALGORITHMS keyAlg, uint32 keySizeInBits, CSSM_KEY_PTR key)
{
    CSSM_RETURN                  crtn;
    CSSM_CC_HANDLE               ccHand;
    CSSM_DATA                    dummyLabel = {8, (uint8 *)"someKey"};
    CSSM_ACCESS_CREDENTIALS      creds;
    
    memset(key, 0, sizeof(CSSM_KEY));
    memset(&creds, 0, sizeof(CSSM_ACCESS_CREDENTIALS));
    crtn = CSSM_CSP_CreateDeriveKeyContext(cspHandle,
                                           CSSM_ALGID_PKCS5_PBKDF2,
                                           keyAlg,
                                           keySizeInBits,
                                           &creds,
                                           NULL,            // BaseKey
                                           1000,            // iterationCount, 1000 is the minimum
                                           &salt,
                                           NULL,            // seed
                                           &ccHand);
    if(crtn) {
        return crtn;
    }
    
    CSSM_PKCS5_PBKDF2_PARAMS pbeParams;
    pbeParams.Passphrase = rawKey;
    pbeParams.PseudoRandomFunction = CSSM_PKCS5_PBKDF2_PRF_HMAC_SHA1;
    CSSM_DATA pbeData = {sizeof(pbeParams), (uint8 *)&pbeParams};
    
    crtn = CSSM_DeriveKey(ccHand,
                          &pbeData,
                          CSSM_KEYUSE_ANY,
                          CSSM_KEYATTR_RETURN_DATA | CSSM_KEYATTR_EXTRACTABLE,
                          &dummyLabel,
                          NULL,            // cred and acl
                          key);
    CSSM_DeleteContext(ccHand);        // ignore error here
    return crtn;
}

/*
 * Free resources allocated in cdsaDeriveKey().
 */
CSSM_RETURN cdsaFreeKey(CSSM_CSP_HANDLE cspHandle, CSSM_KEY_PTR key)
{
    return CSSM_FreeKey(cspHandle,
                        NULL,            // access cred
                        key,
                        CSSM_FALSE);    // don't delete since it wasn't permanent
}

/*
 * Init vector
 */
static uint8 iv[16] = { 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 };
static const CSSM_DATA ivCommon = {16, iv};

/*
 * Encrypt
 */
CSSM_RETURN cdsaEncrypt(CSSM_CSP_HANDLE cspHandle, const CSSM_KEY *key, const CSSM_DATA *plainText, CSSM_DATA_PTR cipherText)
{
    CSSM_RETURN      crtn;
    CSSM_CC_HANDLE   ccHandle;
    CSSM_DATA        remData = {0, NULL};
    CSSM_SIZE        bytesEncrypted;
    
    CSSM_ACCESS_CREDENTIALS creds;
    memset(&creds, 0, sizeof(CSSM_ACCESS_CREDENTIALS));
    
    crtn = CSSM_CSP_CreateSymmetricContext(cspHandle,
                                           key->KeyHeader.AlgorithmId,
                                           CSSM_ALGMODE_CBCPadIV8,
                                           NULL,            // access cred
                                           key,
                                           &ivCommon,            // InitVector
                                           CSSM_PADDING_PKCS7,
                                           NULL,            // Params
                                           &ccHandle);
    
    if(crtn) {
        return crtn;
    }
    
    cipherText->Length = 0;
    cipherText->Data = NULL;
    crtn = CSSM_EncryptData(ccHandle,
                            plainText,
                            1,
                            cipherText,
                            1,
                            &bytesEncrypted,
                            &remData);
    CSSM_DeleteContext(ccHandle);
    if(crtn) {
        return crtn;
    }
    
    cipherText->Length = bytesEncrypted;
    if(remData.Length != 0) {
        /* append remaining data to cipherText */
        uint32 newLen = cipherText->Length + remData.Length;
        cipherText->Data = (uint8 *)appRealloc(cipherText->Data,
                                               newLen,
                                               NULL);
        memmove(cipherText->Data + cipherText->Length,
                remData.Data, remData.Length);
        cipherText->Length = newLen;
        appFree(remData.Data, NULL);
    }
    return CSSM_OK;
}
