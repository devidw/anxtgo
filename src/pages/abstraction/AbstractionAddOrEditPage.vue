<template>
  <q-page padding>
    <q-form class="q-gutter-md" @submit="onSubmit">
      <q-input outlined v-model="abstraction.date" class="q-mb-md">
        <template v-slot:prepend>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="abstraction.date" mask="YYYY-MM-DD HH:mm">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>

        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time
                v-model="abstraction.date"
                mask="YYYY-MM-DD HH:mm"
                format24h
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model="abstraction.description"
        outlined
        type="textarea"
        autogrow
        label="Abstraction"
        :rules="[(val) => !!val || 'Field is required']"
      />

      <div class="row justify-between">
        <q-btn
          type="submit"
          color="primary"
          label="Save"
          icon="save"
          outline
          rounded
        />
        <q-btn
          v-if="action === 'edit'"
          label="Delete"
          @click="deleteAbstraction()"
          color="red"
          outline
          rounded
          icon="delete"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { date } from 'quasar'
import { db } from '../../db'

const router = useRouter()
const route = useRoute()
const action = ref('')
const abstractionId = Number(route.params.id)
const abstraction = ref({
  date: date.formatDate(Date.now(), 'YYYY-MM-DD HH:mm'),
  description: '',
})

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

function createAbstraction() {
  return db.abstractions
    .add({
      date: abstraction.value.date,
      description: abstraction.value.description,
    })
    .then((id) => {
      router.push(`/abstractions/${id}`)
    })
}

function readAbstraction() {
  return db.abstractions
    .get(abstractionId)
    .then((doc) => (abstraction.value = doc))
}

function updateAbstraction() {
  return db.abstractions
    .update(abstractionId, abstraction.value)
    .then(() => router.push(`/abstractions/${abstractionId}`))
}

function deleteAbstraction() {
  db.abstractions.delete(abstractionId).then(() => {
    router.push('/abstractions')
  })
}
</script>
