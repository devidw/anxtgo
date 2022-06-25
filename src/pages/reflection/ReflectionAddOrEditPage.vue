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
          title="Realize the consequences"
          icon="bolt"
          v-model:done="done[2]"
        >
          <a-reflection-consequences :reflection="reflection" />
        </q-step>

        <q-step
          :name="3"
          title="Abstract on the reflection"
          icon="emoji_objects"
          :done="done[3]"
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
          :name="4"
          title="Implements abstraction?"
          icon="o_thumbs_up_down"
          :done="done[4]"
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
import { toolbar, standardizeText } from 'boot/utils'
import ADateTime from 'components/ADateTime.vue'
import ADialogDelete from 'components/ADialogDelete.vue'
import AReflectionConsequences from 'components/AReflectionConsequences.vue'

const router = useRouter()
const route = useRoute()
const action = ref('')
const reflectionId = Number(route.params.id)
const reflection = ref({
  date: date.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss'),
  description: '',
  abstractionId: null,
  implementsAbstraction: null,
  consequences: [
    {
      id: 1,
      value: 2893,
    },
  ],
})
const abstraction = ref({
  date: date.formatDate(Date.now(), 'YYYY-MM-DD HH:mm:ss'),
  description: '',
})
const filteredAbstractions = ref([])
const done = ref({
  1: reflection.value.description.length > 0,
  2: false,
  3:
    reflection.value.abstractionId !== null ||
    abstraction.value.description.length > 0,
  4: reflection.value.implementsAbstraction !== null,
})
const step = ref(2)
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

async function createReflection() {
  await db.reflections.add(Object.assign({}, reflection.value))
  redirectHelper()
}

/**
 * Fill all form fields with the data of the reflection we are editing
 */
async function readReflection() {
  const doc = await db.reflections.get(reflectionId)
  reflection.value = doc
}

async function readAbstraction() {
  const docs = await db.abstractions
    .where({ id: reflection.value.abstractionId })
    .toArray()
  if (docs.length) {
    filteredAbstractions.value = docs
  } else {
    // Fix broken links by unlinking non-existing abstractions
    reflection.value.abstractionId = null
  }
}

async function updateReflection() {
  await db.reflections.update(reflectionId, reflection.value)
  redirectHelper()
}

async function deleteReflection() {
  await db.reflections.delete(reflectionId)
  router.push('/reflections')
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
  // abstraction.value.description = ''
  filteredAbstractions.value = []
}
</script>

<style lang="sass">
.q-item__label--caption br
  display: none
</style>
