import { defineStore } from 'pinia'

export const useCryptoStore = defineStore('crypto', {
  state: () => ({
    crypto: 'encrypted',
  }),

  getters: {
    isEncrypted: state => state.crypto === 'encrypted',
    isDecrypted: state => state.crypto === 'decrypted',
  },

  actions: {
    encrypt() {
      this.crypto = 'encrypted'
    },
    decrypt() {
      this.crypto = 'decrypted'
    }
  }
})
