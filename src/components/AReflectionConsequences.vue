<template lang="pug">
.row.fit.justify-center
  div
    q-input(
      v-for="def in consequencesDefinitions" :label="def.name" :type="def.type" v-model="consequences[getIndex(def.id)].value" borderless @change="onChange")
      template(v-slot:append)
        .a-heading {{ def.symbol }}
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { db } from 'boot/db'

const props = defineProps({
  reflection: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['consequences-changed'])

const consequencesDefinitions = ref([])
const consequences = ref(props.reflection.consequences)

/**
 * Get the index of the consequence with the consequence definition id.
 */
const getIndex = (id) => {
  const index = consequences.value.findIndex(
    (consequence) => consequence.id === id
  )
  return index
}

/**
 * Load consequences definitions from the database
 */
;(async () => {
  const docs = await db.consequences.toArray()
  consequencesDefinitions.value = docs

  /**
   * Add missing consequences to the reflection
   */
  for (const def of consequencesDefinitions.value) {
    if (consequences.value.find((consequence) => consequence.id === def.id)) {
      return
    }
    consequences.value = [
      ...consequences.value,
      {
        id: def.id,
        value: '',
      },
    ]
  }
})()

function onChange() {
  emit('consequences-changed', consequences.value)
}
</script>
