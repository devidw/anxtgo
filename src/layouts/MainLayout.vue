<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="transparent">
      <q-toolbar v-if="$q.screen.lt.md">
        <q-btn
          dense
          flat
          rounded
          icon="las la-caret-right"
          aria-label="Menu"
          color="primary"
          @click="toggleLeftDrawer"
        />

        <!-- <q-toolbar-title class="text-center text-uppercase">
          {{ 'Anxtgo' }}
        </q-toolbar-title> -->
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="$q.screen.lt.md ? $q.screen.width : 300"
      class="column justify-between"
    >
      <q-list>
        <q-item-label header class="text-uppercase">
          <div class="row justify-between items-end">
            <span>
              {{ 'Anxtgo' }}
            </span>
            <q-btn
              v-if="$q.screen.lt.md"
              dense
              flat
              rounded
              icon="las la-caret-left"
              @click="toggleLeftDrawer"
            />
          </div>
        </q-item-label>

        <EssentialLink
          v-for="link in topLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>

      <q-list class="q-pb-xl">
        <!-- <q-item-label header> Navigation </q-item-label> -->

        <q-item
          v-for="link in bottomLinks"
          :key="link.title"
          v-bind="link"
          clickable
          tag="a"
          :to="link.link"
        >
          <q-item-section avatar></q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(link.title) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EssentialLink from 'components/EssentialLink.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const localeOptions = ref([
  { value: 'en-US', label: 'English' },
  { value: 'de', label: 'German' },
])

const leftDrawerOpen = ref(false)
const topLinks = ref([
  {
    title: 'Dashboard',
    caption: 'Overview',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    title: t('reflection.title', 2),
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
])
const bottomLinks = ref([
  {
    title: 'consequences',
    link: '/consequences',
  },
  {
    title: 'exportImport',
    link: '/export-import',
  },
  {
    title: 'preferences',
    link: '/preferences',
  },
])
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style lang="sass">
</style>
