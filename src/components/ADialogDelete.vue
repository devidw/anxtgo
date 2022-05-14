<template>
  <q-dialog maximized auto-close transition-show="fade" transition-hide="fade">
    <q-card class="a-bg-negative">
      <q-card-actions class="fit row justify-center items-center">
        <q-btn
          @click="callback"
          outline
          rounded
          icon="las la-trash"
          color="red"
          size="xl"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  callback: {
    type: Function,
    default: () => {
      //
    },
  },
})
</script>

<style lang="sass">
.q-card
  backdrop-filter: blur(1.5px)
</style>
