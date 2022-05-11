<template>
  <q-page padding>
    <h2 class="text-h5" v-html="$t('preferences')" />
    <q-select
      v-model="locale"
      :options="localeOptions"
      :label="$t('language')"
      emit-value
      map-options
      rounded
      outlined
    />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' })
const localeOptions = ref([
  { value: 'en-US', label: 'English' },
  { value: 'de', label: t('german') },
])
</script>
