<template>
  <div class="row fit justify-center wrap">
    <div
      v-for="def in consequencesDefinitions"
      :key="def.id"
      :data-set="(val = consequences[getIndex(def.id)].value)"
      class="fit q-mb-md"
      :class="{ 'text-center': $q.screen.gt.sm }"
    >
      <div class="text-h6 cursor-pointer">
        I have
        <span v-if="val != 0">
          <span :class="{ 'text-green': val > 0, 'text-red': val < 0 }">
            <span v-if="val > 0">won</span>
            <span v-if="val < 0">lost</span>
            {{ Math.abs(val) }} {{ def.symbol }}
          </span>
          of
        </span>
        <span v-else>
          <span class="">won/lost</span>
          no
        </span>
        {{ def.name.toLowerCase() }}.

        <q-popup-edit
          v-model="editing"
          v-slot="scope"
          class="bg-grey-9"
          max-width="120px"
          :touch-position="$q.screen.gt.sm"
        >
          <q-input
            v-model="consequences[getIndex(def.id)].value"
            :type="def.type"
            :prefix="def.symbol"
            :placeholder="0"
            borderless
            autofocus
            @keyup.enter="scope.set"
            @change="onChange"
          />
        </q-popup-edit>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onBeforeMount } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/db'

const props = defineProps({
  reflection: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['consequences-changed'])

const $q = useQuasar()
const consequencesDefinitions = ref([])
const consequences = ref(props.reflection.consequences)
const editing = ref(false)

/**
 * Get the index of the consequence with the consequence definition id.
 */
const getIndex = (id) => {
  const index = consequences.value.findIndex(
    (consequence) => consequence.id === id
  )
  return index
}

function onChange() {
  emit('consequences-changed', consequences.value)
}

onBeforeMount(async () => {
  /**
   * Load consequences definitions from the database
   */
  const docs = await db.consequences.toArray()
  consequencesDefinitions.value = docs

  /**
   * Add missing consequences to the reflection
   */
  consequencesDefinitions.value.map((def) => {
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
  })

  // console.log(consequencesDefinitions.value)
})
</script>
