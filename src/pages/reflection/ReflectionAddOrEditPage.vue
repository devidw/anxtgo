<template>
  <q-page padding>
    <q-form class="q-gutter-md" @submit.prevent.stop="onSubmit">
      <q-stepper
        v-model="step"
        :vertical="$q.screen.lt.md"
        ref="stepper"
        color="primary"
        transition-prev="scale"
        transition-next="scale"
        header-nav
        animated
        flat
      >
        <q-step
          :name="1"
          title="Reflect on the experience"
          icon="psychology"
          :done="done[1]"
        >
          <q-input outlined dense v-model="reflection.date" class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="las la-calendar-day" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="reflection.date" mask="YYYY-MM-DD HH:mm:ss">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        :label="$t('close')"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="las la-clock" class="cursor-pointer">
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
                      <q-btn
                        v-close-popup
                        :label="$t('close')"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-editor
            v-model="reflection.description"
            :toolbar="toolbar"
            :placeholder="$t('reflection.reflect')"
          />
        </q-step>

        <q-step
          :name="2"
          title="Abstract on the reflection"
          icon="emoji_objects"
          :done="done[2]"
        >
          <!-- v-if="!reflection.abstractionId" -->
          <q-editor
            v-model="abstraction.description"
            @keyup="filterAbstractions"
            :toolbar="toolbar"
            :placeholder="$t('reflection.abstract')"
            class="q-mb-lg"
          />
          <q-option-group
            v-model="test"
            :options="filteredAbstractionOptions()"
            type="checkbox"
          />
        </q-step>

        <q-step
          :name="3"
          title="Implements abstraction?"
          icon="thumbs_up_down"
          :done="done[3]"
        >
          <div class="q-gutter-sm text-center">
            <q-toggle
              v-model="reflection.implementsAbstraction"
              toggle-indeterminate
              indeterminate-icon="thumbs_up_down"
              checked-icon="thumb_up"
              unchecked-icon="thumb_down"
              size="lg"
              color="green"
            />
            <p
              v-html="
                reflection.implementsAbstraction === true
                  ? $t('Reflection implements abstraction')
                  : reflection.implementsAbstraction === false
                  ? $t('Reflection does not implement abstraction')
                  : $t(
                      'I am not sure if the reflection implements the abstraction'
                    )
              "
            />
          </div>
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <div class="row justify-between">
              <div class="row justify-center">
                <q-btn
                  v-if="step > 1"
                  @click="$refs.stepper.previous()"
                  color="grey-5"
                  icon="las la-arrow-left"
                  outline
                  rounded
                  class="q-mr-sm"
                />
                <q-btn
                  v-if="step < 3"
                  @click="$refs.stepper.next()"
                  color="grey-5"
                  icon="las la-arrow-right"
                  outline
                  rounded
                />
              </div>
              <div class="row justify-end">
                <q-btn
                  type="submit"
                  color="primary"
                  icon="las la-save"
                  outline
                  rounded
                  class="q-mr-sm"
                />

                <q-btn
                  v-if="action === 'edit'"
                  @click="deleteReflection()"
                  color="red"
                  icon="las la-trash"
                  outline
                  rounded
                />
              </div>
            </div>
          </q-stepper-navigation>
        </template>

        <!-- <template v-slot:message>
          <q-banner v-if="step === 1" class="q-px-lg">
            <q-expansion-item
              expand-separator
              icon="las la-info"
              label="How to reflect on the experience?"
              caption="John Doe"
            >
              sdds
            </q-expansion-item>
          </q-banner>
        </template> -->
      </q-stepper>
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

/**
 * What are we here for?
 */
;(() => {
  if (route.path.endsWith('add')) {
    action.value = 'add'
  } else if (route.path.endsWith('edit')) {
    action.value = 'edit'
    readReflectionAndMaybeAbstraction()
  } else {
    router.push('/reflections')
  }
})()

/**
 * Populate the abstraction based on the passed query parameter
 */
;(() => {
  if (route.query.abstractionId) {
    reflection.value.abstractionId = Number(route.query.abstractionId)
    readAbstraction()
  }
})()

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
function readReflectionAndMaybeAbstraction() {
  db.reflections
    .get(reflectionId)
    .then((doc) => (reflection.value = doc))
    .then(() => {
      if (reflection.value.abstractionId) {
        readAbstraction()
      }
    })
}

function readAbstraction() {
  db.abstractions
    .where({ id: reflection.value.abstractionId })
    .toArray()
    .then((docs) => (filteredAbstractions.value = docs))
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
  console.log(reflection.value.abstractionId)
  if (reflection.value.abstractionId === null) {
    return
  }
  reflection.value.abstractionId = null
  abstraction.value.description = ''
  filteredAbstractions.value = []
}

const filteredAbstractionOptions = () => {
  const options = filteredAbstractions.value.map((abstraction) => {
    return {
      value: abstraction.id,
      label: abstraction.description,
      checkedIcon: 'task_alt',
      uncheckedIcon: 'highlight_off',
    }
  })
  return options
}

const test = ref([1])
</script>

<style lang="sass"></style>
