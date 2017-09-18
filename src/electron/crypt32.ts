import { ffi } from 'ffi';
import { ref } from 'ref';
import { struct } from 'ref-struct';

export const DATA_BLOB = struct({
    cbData: ref.types.uint32,
    pbData: 'string'
});
const PDATA_BLOB = new ref.refType(DATA_BLOB);

export const crypt32 = ffi.Library('crypt32.dll', {
   // 'CryptProtectData': ['bool', [PDATA_BLOB, 'string', PDATA_BLOB, 'pointer', 'pointer', ref.types.uint32, PDATA_BLOB]]
});
