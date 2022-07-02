<template>
  <q-page padding>
    <q-form class="q-gutter-md abstraction-form" @submit="onSubmit">
      <!-- <a-date-time v-model="abstraction.date" class="q-mb-md" /> -->

      <q-stepper flat v-model="step">
        <q-step :name="1" :title="$t('abstraction.title')">
          <q-input
            borderless
            v-model="abstraction.title"
            placeholder="Your abstraction title"
          />

          <q-editor
            v-model="abstraction.description"
            :toolbar="toolbar"
            :placeholder="$t('reflection.abstract')"
            toolbar-rounded
            square
            flat
          />
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <div class="row justify-between">
              <q-btn
                type="submit"
                icon="las la-save"
                color="primary"
                outline
                rounded
              />
              <q-btn
                v-if="action === 'edit'"
                @click="showDeleteDialog = true"
                icon="las la-trash"
                color="red"
                outline
                rounded
              />
            </div>
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-form>
  </q-page>

  <a-dialog-delete v-model="showDeleteDialog" :callback="deleteAbstraction" />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { date } from 'quasar'
import { db } from 'boot/db'
import { toolbar } from 'boot/utils'
import ADateTime from 'components/ADateTime.vue'
import ADialogDelete from 'components/ADialogDelete.vue'

const router = useRouter()
const route = useRoute()
const action = ref('')
const abstractionId = Number(route.params.id)
const abstraction = ref({
  date: date.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss'),
  title: '',
  description: '',
})
const step = ref(1)
const showDeleteDialog = ref(false)

if (route.path.endsWith('add')) {
  action.value = 'add'
} else if (route.path.endsWith('edit')) {
  action.value = 'edit'
  readAbstraction()
}

function onSubmit() {
  switch (action.value) {
    case 'add':
      createAbstraction()
      break
    case 'edit':
      updateAbstraction()
      break
  }
}

async function createAbstraction() {
  const id = await db.abstractions.add(Object.assign({}, abstraction.value))
  router.push(`/abstractions/${id}`)
}

async function readAbstraction() {
  const doc = await db.abstractions.get(abstractionId)
  abstraction.value = doc
}

async function updateAbstraction() {
  await db.abstractions.update(abstractionId, abstraction.value)
  router.push(`/abstractions/${abstractionId}`)
}

/**
 * Delete the abstraction
 * Also unlink existing links between abstractions and reflections
 */
async function deleteAbstraction() {
  await db.abstractions.delete(abstractionId)
  const reflections = await db.reflections
    .where('abstractionId')
    .equals(abstractionId)
    .toArray()
  reflections.forEach(async (reflection) => {
    await db.reflections.update(reflection.id, {
      abstractionId: 0,
    })
  })
  router.push('/abstractions')
}
</script>

<style lang="sass">
.abstraction-form
  .q-stepper__header
    display: none

  .q-field__native
    font-size: 1.5rem
    font-family: anxtgo-headline
</style>
