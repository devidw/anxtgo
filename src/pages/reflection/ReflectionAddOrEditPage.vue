<template>
  <q-page padding>
    <q-form class="q-gutter-md" @submit.prevent.stop="onSubmit">
      <q-stepper
        v-model="step"
        vertical
        header-nav
        color="primary"
        animated
        ref="stepper"
      >
        <q-step
          :name="1"
          title="Reflect on the experience"
          icon="visibility"
          :done="done[1]"
        >
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

          <q-input
            v-model="description"
            outlined
            autogrow
            type="textarea"
            label="Reflection"
            :rules="[(val) => !!val || 'Field is required']"
          />
        </q-step>

        <q-step
          :name="2"
          title="Abstract on the reflection"
          icon="psychology"
          :done="done[2]"
        >
          <q-input
            v-if="!abstractionId"
            v-model="abstractionDescription"
            @keyup="filterAbstractions"
            outlined
            autogrow
            type="textarea"
            label="Abstraction"
            class="q-mb-lg"
          />
          <q-list>
            <q-item
              v-for="abstraction in filteredAbstractions"
              :key="abstraction.id"
              v-ripple
              tag="label"
            >
              <q-item-section avatar>
                <q-radio
                  v-model="abstractionId"
                  :val="abstraction.id"
                  checked-icon="task_alt"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  <q-item-label>
                    {{ abstraction.date }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ abstraction.description }}
                  </q-item-label>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn
            v-if="abstractionId"
            @click="unlinkAbstraction"
            outline
            rounded
            color="primary"
            label="Unlink"
          />
        </q-step>

        <q-step
          :name="3"
          title="Implements abstraction?"
          icon="thumbs_up_down"
          :done="done[3]"
        >
          <div class="q-gutter-sm">
            <q-toggle
              toggle-indeterminate
              indeterminate-icon="thumbs_up_down"
              checked-icon="thumb_up"
              unchecked-icon="thumb_down"
              v-model="implementsAbstraction"
              label="Implements abstraction?"
            />
          </div>
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn
              v-if="step === 3"
              type="submit"
              color="primary"
              label="Save"
              icon="save"
              outline
              rounded
            />
            <q-btn
              v-if="step < 3"
              outline
              rounded
              @click="
                () => {
                  $refs.stepper.next()
                  setDone(step)
                }
              "
              color="primary"
              label="Continue"
              icon="arrow_forward"
            />
            <q-btn
              v-if="step > 1"
              outline
              rounded
              color="primary"
              @click="$refs.stepper.previous()"
              label="Back"
              icon="arrow_back"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>

      <div class="row justify-end">
        <q-btn
          v-if="action === 'edit'"
          @click="deleteReflection()"
          label="Delete"
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
const implementsAbstraction = ref(null)
const abstractionId = ref(null)
const abstractionDescription = ref('')
const abstractions = ref([])
const filteredAbstractions = ref([])
const done = ref({
  1: theDate.value.length > 0 && description.value.length > 0,
  2: abstractionId.value !== null || abstractionDescription.value.length > 0,
  3: implementsAbstraction.value !== null,
})
const step = ref(1)

const getAbstractions = () => {
  return db
    .collection('abstractions')
    .get()
    .then((docs) => {
      abstractions.value = docs
    })
}

getAbstractions()

const getId = () => {
  return Number(route.params.id)
}

if (route.path.endsWith('add')) {
  action = ref('add')
} else if (route.path.endsWith('edit')) {
  action = ref('edit')
  populateReflection(getId())
}

function onSubmit() {
  maybeAddAbstraction()
  if (action.value === 'add') {
    addReflection().then(() => {
      redirectAfterSave()
    })
  } else if (action.value === 'edit') {
    updateReflection(getId()).then(() => {
      redirectAfterSave()
    })
  }
}

/**
 * Fill all form fields with the data of the reflection we are editing
 */
function populateReflection(id: number) {
  db.collection('reflections')
    .doc({ id: id })
    .get()
    .then((doc) => {
      theDate.value = doc.date
      description.value = doc.description
      abstractionId.value = doc.abstractionId
      implementsAbstraction.value = doc.implementsAbstraction
    })
    /**
     * If the reflection has an abstraction already selected, we set it to the list of shown abstractions
     */
    .then(() => {
      if (abstractionId.value) {
        getAbstractions().then(() => {
          filteredAbstractions.value = abstractions.value.filter(
            (abstraction) => abstraction.id === abstractionId.value
          )
        })
      }
    })
}

function addReflection() {
  const newReflection = {
    id: Date.now(),
    date: theDate.value,
    description: description.value,
    abstractionId: abstractionId.value,
    implementsAbstraction: implementsAbstraction.value,
  }
  return db.collection('reflections').add(newReflection)
}

function updateReflection(id: number) {
  return db.collection('reflections').doc({ id: id }).update({
    date: theDate.value,
    description: description.value,
    abstractionId: abstractionId.value,
    implementsAbstraction: implementsAbstraction.value,
  })
}

function deleteReflection() {
  db.collection('reflections')
    .doc({ id: getId() })
    .delete()
    .then(() => {
      router.push('/reflections')
    })
}

function filterAbstractions() {
  const query = abstractionDescription.value
  if (query.length < 2) {
    filteredAbstractions.value = []
    return
  }
  filteredAbstractions.value = abstractions.value.filter((abstraction) => {
    return abstraction.description.toLowerCase().includes(query.toLowerCase())
  })
}

function unlinkAbstraction() {
  abstractionId.value = null
  abstractionDescription.value = ''
  filteredAbstractions.value = []
}

function maybeAddAbstraction() {
  if (abstractionDescription.value.length > 0 && !abstractionId.value) {
    const abstraction = {
      id: Date.now(),
      date: formattedString,
      description: abstractionDescription.value,
    }
    abstractionId.value = abstraction.id
    db.collection('abstractions')
      .add(abstraction)
      .then(() => {
        abstractionDescription.value = ''
      })
  }
}

function redirectAfterSave() {
  if (abstractionId.value) {
    router.push(`/abstractions/${abstractionId.value}`)
  } else {
    router.push('/reflections')
  }
}
</script>
