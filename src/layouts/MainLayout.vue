<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-dark">
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
import EssentialLink from 'components/EssentialLink.vue'

const leftDrawerOpen = ref(false)
const essentialLinks = ref([
  {
    title: 'Reflections',
    caption: 'Reflect on experiences',
    icon: 'psychology',
    link: '/reflections',
  },
  {
    title: 'Abstractions',
    caption: 'Abstract on reflections',
    icon: 'emoji_objects',
    link: '/abstractions',
  },
  {
    title: 'Export & Import',
    caption: 'Export and import your data',
    icon: 'sync',
    link: '/export-import',
  },
])
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
