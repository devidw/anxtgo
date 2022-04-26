<template>
  <q-page padding>
    <section>
      <h2 class="text-h5">Encryption and Decryption</h2>
      <form @submit.prevent="processKey()">
        <q-input
          v-model="key"
          ref="keyRef"
          type="text"
          label="Create or enter a key"
          rounded
          outlined
          :rules="keyRules"
        />
        <q-btn
          label="Encrypt or decrypt"
          type="submit"
          rounded
          outline
          color="primary"
          icon="key"
        />
      </form>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { applyEncryptionMiddleware } from 'dexie-encrypted'
import { db, config } from 'boot/db'
import { useCryptoStore } from 'stores/crypto'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const cryptoStore = useCryptoStore()
const keyRef = ref('')
const key = ref('')
const keyRules = [
  (v) => (v !== null && v !== '') || 'Please enter a key',
  (v) => v.length <= 32 || 'Key must be less than or equal to 32 characters',
  (v) => v.match(/^[a-zA-Z0-9]+$/) || 'Key must be alphanumeric',
]

/**
 * Called by dexie-encrypted when there was an error decrypting data
 */
const onFail = (db) => {
  // window.location.reload()
  // cryptoStore.encrypt()
  // router.push('/encryption-decryption')
  // $q.notify({
  //   color: 'negative',
  //   message: 'Failed to decrypt database',
  // })
}

/**
 * Create a valid uint8Array 32 bytes long key from the user input to use for database encryption
 * When the input length is less than 32 bytes, it will be padded with 0s
 * @returns {Uint8Array}
 */
const theKey = () => {
  const uint8ArrayKey = new TextEncoder().encode(key.value)
  const keyArray = new Uint8Array(32)
  keyArray.set(uint8ArrayKey)
  return keyArray
}

const processKey = () => {
  if (!keyRef.value.validate()) {
    return
  }

  // Open the doors for now, maybe will be closed again by the onFail callback
  cryptoStore.decrypt()

  applyEncryptionMiddleware(db, theKey(), config, onFail)

  db.version(2).stores({
    reflections: '++id, abstractionId',
    abstractions: '++id',
  })

  router.push('/reflections')
}
</script>
