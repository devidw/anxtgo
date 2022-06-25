<template lang="pug">
.row.fit.justify-center
  div
    q-input(v-for="def in consequencesDefinitions" :label="def.name" :type="def.type" v-model="consequences[getIndex(def.id)].value" borderless)
      template(v-slot:append)
        .a-heading {{ def.symbol }}
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'boot/db'

const props = defineProps({
  reflection: {
    type: Object,
    required: true,
  },
})

const consequencesDefinitions = ref([])
const consequences = ref(props.reflection.consequences)
/**
 * Get the index of the consequence with the consequence definition id.
 */
const getIndex = (id) => {
  const index = consequences.value.findIndex(
    (consequence) => consequence.id === id
  )
  if (index > -1) {
    return index
  }
  consequences.value = [
    ...consequences.value,
    {
      id,
      value: '',
    },
  ]
  return consequences.value.length - 1
}

/**
 * Load consequences definitions from the database
 */
;(async () => {
  const docs = await db.consequences.toArray()
  consequencesDefinitions.value = docs
})()
</script>
