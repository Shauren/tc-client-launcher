#ifndef CDSACrypt_h__
#define CDSACrypt_h__

#include <Security/cssm.h>

namespace CDSA
{
    CSSM_RETURN CspAttach(CSSM_CSP_HANDLE *cspHandle);
    CSSM_RETURN CspDetach(CSSM_CSP_HANDLE cspHandle);

    CSSM_RETURN DeriveKey(CSSM_CSP_HANDLE cspHandle, CSSM_DATA rawKey, CSSM_DATA salt, CSSM_ALGORITHMS keyAlg, uint32 keySizeInBits, CSSM_KEY_PTR key);
    CSSM_RETURN FreeKey(CSSM_CSP_HANDLE cspHandle, CSSM_KEY_PTR key);

    CSSM_RETURN Encrypt(CSSM_CSP_HANDLE cspHandle, CSSM_KEY const* key, CSSM_DATA const* plainText, CSSM_DATA_PTR cipherText);
    CSSM_RETURN Decrypt(CSSM_CSP_HANDLE cspHandle, CSSM_KEY const* key, CSSM_DATA const* cipherText, CSSM_DATA_PTR plainText);
}

#endif // CCDSACrypt_h__
