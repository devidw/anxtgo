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
          <q-input outlined v-model="reflection.date" class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="reflection.date" mask="YYYY-MM-DD HH:mm:ss">
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
                    v-model="reflection.date"
                    mask="YYYY-MM-DD HH:mm:ss"
                    format24h
                    with-seconds
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-editor
            v-model="reflection.description"
            :toolbar="toolbar"
            toolbar-rounded
          />
        </q-step>

        <q-step
          :name="2"
          title="Abstract on the reflection"
          icon="psychology"
          :done="done[2]"
        >
          <q-editor
            v-if="!reflection.abstractionId"
            v-model="abstraction.description"
            @keyup="filterAbstractions"
            :toolbar="toolbar"
            toolbar-rounded
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
                  v-model="reflection.abstractionId"
                  :val="abstraction.id"
                  checked-icon="task_alt"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  <q-item-label>
                    {{ formatDateDefault(abstraction.date) }}
                  </q-item-label>
                  <q-item-label caption v-html="abstraction.description" />
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn
            v-if="reflection.abstractionId"
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
              v-model="reflection.implementsAbstraction"
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
              @click="$refs.stepper.next()"
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

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { date } from 'quasar'
import { db } from 'boot/db'
import { toolbar, formatDateDefault, standardizeText } from 'boot/utils'

const router = useRouter()
const route = useRoute()
const action = ref('')
const reflectionId = Number(route.params.id)
const reflection = ref({
  date: date.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss'),
  description: '',
  abstractionId: null,
  implementsAbstraction: null,
})
const abstraction = ref({
  date: date.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss'),
  description: '',
})
const filteredAbstractions = ref([])
const done = ref({
  1:
    reflection.value.date.length > 0 && reflection.value.description.length > 0,
  2:
    reflection.value.abstractionId !== null ||
    abstraction.value.description.length > 0,
  3: reflection.value.implementsAbstraction !== null,
})
const step = ref(1)

if (route.path.endsWith('add')) {
  action.value = 'add'
} else if (route.path.endsWith('edit')) {
  action.value = 'edit'
  readReflection()
} else {
  router.push('/reflections')
}

/**
 * Process submission to handle maybe add a new abstraction and after that create or update the reflection
 */
function onSubmit() {
  maybeAddAbstraction().then(() => {
    switch (action.value) {
      case 'add':
        createReflection()
        break
      case 'edit':
        updateReflection()
        break
      default:
        break
    }
  })
}

function redirectHelper() {
  if (reflection.value.abstractionId) {
    router.push(`/abstractions/${reflection.value.abstractionId}`)
  } else {
    router.push('/reflections')
  }
}

function createReflection() {
  return db.reflections.add(Object.assign({}, reflection.value)).then(() => {
    redirectHelper()
  })
}

/**
 * Fill all form fields with the data of the reflection we are editing
 * And when the reflection already has an abstraction selected, we set it to the list of shown abstractions
 */
function readReflection() {
  db.reflections
    .get(reflectionId)
    .then((doc) => (reflection.value = doc))
    .then(() => {
      if (reflection.value.abstractionId) {
        db.abstractions
          .where({ id: reflection.value.abstractionId })
          .toArray()
          .then((docs) => (filteredAbstractions.value = docs))
      }
    })
}

function updateReflection() {
  return db.reflections.update(reflectionId, reflection.value).then(() => {
    redirectHelper()
  })
}

function deleteReflection() {
  db.reflections.delete(reflectionId).then(() => {
    router.push('/reflections')
  })
}

function maybeAddAbstraction() {
  if (
    !reflection.value.abstractionId &&
    abstraction.value.description.length > 0
  ) {
    return db.abstractions
      .add(Object.assign({}, abstraction.value))
      .then((id) => {
        reflection.value.abstractionId = id
        abstraction.value.description = ''
      })
  }
  return new Promise((resolve) => {
    resolve()
  })
}

function filterAbstractions() {
  const query = standardizeText(abstraction.value.description)
  if (query.length < 2) {
    filteredAbstractions.value = []
    return
  }
  db.abstractions
    .filter((abstraction) => {
      return standardizeText(abstraction.description).includes(query)
    })
    .toArray()
    .then((abstractions) => {
      filteredAbstractions.value = abstractions
    })
}

function unlinkAbstraction() {
  reflection.value.abstractionId = null
  abstraction.value.description = ''
  filteredAbstractions.value = []
}
</script>

<style lang="sass"></style>
