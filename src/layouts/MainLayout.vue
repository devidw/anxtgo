<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> {{ 'Anxtgo' }} </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Navigation </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useCryptoStore } from 'stores/crypto'
import EssentialLink from 'components/EssentialLink.vue'

const crypto = useCryptoStore()
const leftDrawerOpen = ref(false)
const essentialLinks = ref([])
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const encryptedLinks = [
  {
    title: 'Encryption & Decryption',
    caption: 'Encrypt and decrypt data',
    icon: 'lock',
    link: '/encryption-decryption',
  },
]

const decryptedLinks = [
  {
    title: 'Reflections',
    caption: 'Reflect on experiences',
    icon: 'visibility',
    link: '/reflections',
  },
  {
    title: 'Abstractions',
    caption: 'Abstract on reflections',
    icon: 'psychology',
    link: '/abstractions',
  },
  {
    title: 'Export & Import',
    caption: 'Export and import your data',
    icon: 'sync',
    link: '/export-import',
  },
]

essentialLinks.value = crypto.isEncrypted ? encryptedLinks : decryptedLinks

crypto.$subscribe((mutation, state) => {
  essentialLinks.value =
    state.crypto === 'encrypted' ? encryptedLinks : decryptedLinks
})
</script>
