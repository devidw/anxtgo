<template>
  <q-input
    rounded
    outlined
    dense
    debounce="300"
    :placeholder="$t('search')"
    ref="search"
  >
    <template v-slot:prepend>
      <q-icon name="las la-search" />
    </template>
    <!-- <template v-slot:append>
      <q-icon name="las la-times" class="cursor-pointer" />
    </template> -->
  </q-input>
</template>

<script setup>
</script>
