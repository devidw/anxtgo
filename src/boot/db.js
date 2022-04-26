import Dexie from 'dexie'
import { applyEncryptionMiddleware, cryptoOptions, clearAllTables } from 'dexie-encrypted'
// const nacl = require('tweetnacl')

export const db = new Dexie('anxtgo')

export const config = {
  reflections: {
    type: cryptoOptions.ENCRYPT_LIST,
    fields: ['date', 'description', 'implementsAbstraction',],
  },
  abstractions: {
    type: cryptoOptions.ENCRYPT_LIST,
    fields: ['date', 'description',],
  },
}
