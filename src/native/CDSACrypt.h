#ifndef CDSACrypt_h__
#define CDSACrypt_h__

#ifdef    __cplusplus
extern "C" {
#endif

#include <Security/cssm.h>
#include <CoreFoundation/CFPreferences.h>
    
CSSM_RETURN cdsaCspAttach(CSSM_CSP_HANDLE *cspHandle);
CSSM_RETURN cdsaCspDetach(CSSM_CSP_HANDLE cspHandle);
    
CSSM_RETURN cdsaDeriveKey(CSSM_CSP_HANDLE cspHandle, CSSM_DATA rawKey, CSSM_DATA salt, CSSM_ALGORITHMS keyAlg, uint32 keySizeInBits, CSSM_KEY_PTR key);
CSSM_RETURN cdsaFreeKey(CSSM_CSP_HANDLE cspHandle, CSSM_KEY_PTR key);
    
CSSM_RETURN cdsaEncrypt(CSSM_CSP_HANDLE cspHandle, const CSSM_KEY *key, const CSSM_DATA *plainText, CSSM_DATA_PTR cipherText);
    
#ifdef    __cplusplus
}
#endif

#endif /* CCDSACrypt_h__ */
