<template>
  <q-page padding>
    <q-form class="q-gutter-md" @submit="onSubmit">
      <div style="">
        <q-input outlined v-model="theDate" mask="date" :rules="['date']">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="qDateProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="theDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <q-input
        v-model="description"
        outlined
        type="textarea"
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

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { date } from 'quasar'
import Localbase from 'localbase'

const router = useRouter()
const route = useRoute()
const db = new Localbase('db')
let action = ref('')
const formattedString = date.formatDate(Date.now(), 'YYYY/MM/DD')
const theDate = ref(formattedString)
const description = ref('')

const getId = () => {
  return Number(route.params.id)
}

if (route.path.endsWith('add')) {
  action = ref('add')
} else if (route.path.endsWith('edit')) {
  action = ref('edit')
  populateAbstraction(getId())
}

function onSubmit() {
  if (action.value === 'add') {
    addAbstraction().then(() => {
      router.push('/abstractions')
    })
  } else if (action.value === 'edit') {
    updateAbstraction(getId()).then(() => {
      router.push('/abstractions')
    })
  }
}

function populateAbstraction(id: number) {
  db.collection('abstractions')
    .doc({ id: id })
    .get()
    .then((doc) => {
      theDate.value = doc.date
      description.value = doc.description
    })
}

function addAbstraction() {
  const newAbstraction = {
    id: Date.now(),
    date: theDate.value,
    description: description.value,
  }
  return db.collection('abstractions').add(newAbstraction)
}

function updateAbstraction(id: number) {
  return db.collection('abstractions').doc({ id: id }).update({
    date: theDate.value,
    description: description.value,
  })
}

function deleteAbstraction() {
  db.collection('abstractions')
    .doc({ id: getId() })
    .delete()
    .then(() => {
      router.push('/abstractions')
    })
}
</script>
