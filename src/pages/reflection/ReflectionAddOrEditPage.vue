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
          <!-- <a-date-time v-model="reflection.date" class="q-mb-md" /> -->

          <q-editor
            v-model="reflection.description"
            :toolbar="toolbar"
            :placeholder="$t('reflection.reflect')"
            square
            flat
          />
        </q-step>

        <q-step
          :name="2"
          title="Abstract on the reflection"
          icon="emoji_objects"
          :done="done[2]"
        >
          <q-editor
            v-if="!reflection.abstractionId"
            v-model="abstraction.description"
            @keyup="filterAbstractions"
            :toolbar="toolbar"
            :placeholder="$t('reflection.abstract')"
            class="q-mb-lg"
            square
            flat
          />
          <q-list>
            <q-item
              v-for="abstraction in filteredAbstractions"
              :key="abstraction.id"
              tag="label"
            >
              <q-item-section avatar style="justify-content: start">
                <q-radio
                  v-model="reflection.abstractionId"
                  :val="abstraction.id"
                  checked-icon="las la-check-circle"
                  unchecked-icon="las la-times-circle"
                />
              </q-item-section>
              <q-item-section @click="unlinkAbstraction(abstraction.id)">
                <q-item-label>
                  <q-item-label v-if="abstraction.title" class="a-heading">
                    {{ abstraction.title }}
                  </q-item-label>
                  <q-item-label caption v-html="abstraction.description" />
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-step>

        <q-step
          :name="3"
          title="Implements abstraction?"
          icon="o_thumbs_up_down"
          :done="done[3]"
        >
          <div class="q-gutter-sm text-center">
            <q-toggle
              v-model="reflection.implementsAbstraction"
              toggle-indeterminate
              indeterminate-icon="o_thumbs_up_down"
              checked-icon="o_thumb_up"
              unchecked-icon="o_thumb_down"
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
                  @click="showDeleteDialog = true"
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

  <a-dialog-delete v-model="showDeleteDialog" :callback="deleteReflection" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { date } from 'quasar'
import { db } from 'boot/db'
import {
  toolbar,
  formatDateDefault,
  stripHtml,
  standardizeText,
} from 'boot/utils'
import ADateTime from 'components/ADateTime'
import ADialogDelete from 'components/ADialogDelete'

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
const showDeleteDialog = ref(false)

/**
 * Keep only the selected abstraction in the list of shown abstractions, when the abstraction is selected
 */
watch(
  () => reflection.value.abstractionId,
  (abstractionId) => {
    if (abstractionId) {
      readAbstraction()
    } else {
      filteredAbstractions.value = []
    }
  }
)

/**
 * What are we here for?
 */
;(() => {
  if (route.path.endsWith('add')) {
    action.value = 'add'
  } else if (route.path.endsWith('edit')) {
    action.value = 'edit'
    readReflection()
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
 */
function readReflection() {
  db.reflections.get(reflectionId).then((doc) => (reflection.value = doc))
}

function readAbstraction() {
  db.abstractions
    .where({ id: reflection.value.abstractionId })
    .toArray()
    .then((docs) => {
      if (docs.length) {
        filteredAbstractions.value = docs
      } else {
        // Fix broken links by unlinking non-existing abstractions
        reflection.value.abstractionId = null
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
      return standardizeText(
        abstraction.title + abstraction.description
      ).includes(query)
    })
    .toArray()
    .then((abstractions) => {
      filteredAbstractions.value = abstractions
    })
}

function unlinkAbstraction(abstractionId) {
  if (
    reflection.value.abstractionId === null ||
    abstractionId !== reflection.value.abstractionId // Not selected radio options need to be ignored, so they can be selected
  ) {
    return
  }
  reflection.value.abstractionId = null
  abstraction.value.description = ''
  filteredAbstractions.value = []
}
</script>

<style lang="sass">
.q-item__label--caption br
  display: none
</style>
