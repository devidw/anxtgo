import { boot } from 'quasar/wrappers'
import { useCryptoStore } from 'stores/crypto'

export default boot(({ router, store }) => {
  router.beforeEach((to, from) => {
    const cryptoStore = useCryptoStore()

    console.log(cryptoStore.crypto)

    // When data is encrypted and we are not on the encryption/decryption page, redirect to it
    if (cryptoStore.isEncrypted && to.path !== '/encryption-decryption') {
      return { path: '/encryption-decryption' }
    }

    // When data is decrypted don't allow to go to the encryption/decryption page
    // if (cryptoStore.isDecrypted && to.path === '/encryption-decryption') {
    //   return false
    // }
  })
})
