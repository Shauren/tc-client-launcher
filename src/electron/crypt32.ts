import * as ffi from 'ffi';
import * as ref from 'ref';
import * as array from 'ref-array';
import * as struct from 'ref-struct';

export const ByteArray = array(ref.types.byte);

export const DATA_BLOB = struct({
    cbData: ref.types.uint32,
    pbData: ByteArray
});
const PDATA_BLOB = new ref.refType(DATA_BLOB);

export const crypt32 = ffi.Library('crypt32', {
    'CryptProtectData': ['bool', [PDATA_BLOB, ref.refType(ref.types.void), PDATA_BLOB, ref.refType(ref.types.void), ref.refType(ref.types.void), ref.types.uint32, PDATA_BLOB]]
});
