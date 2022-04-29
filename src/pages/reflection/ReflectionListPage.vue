<template>
  <q-page padding>
    <q-table
      grid
      grid-header
      title="Reflections"
      :rows="rows"
      :columns="columns"
      :filter="filter"
      :filter-method="filterBy"
      row-key="name"
      :binary-state-sort="true"
      :pagination="pagination"
      :rows-per-page-options="rowsPerPageOptions"
    >
      <template v-slot:top-left>
        <q-btn
          label="Add"
          color="primary"
          icon="add"
          outline
          rounded
          to="/reflections/add"
          class="q-mb-xs-md q-mb-sm-none"
        />
      </template>

      <template v-slot:top-right v-if="rows.length > 0">
        <q-input
          rounded
          outlined
          dense
          debounce="300"
          v-model="filter.search"
          placeholder="Search"
          class="q-mr-md"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon
              name="close"
              @click="filter.search = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <q-select
          v-model="filter.showAbstracted"
          :options="options"
          rounded
          outlined
          dense
        />
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        >
          <q-card
            :class="{
              column: true,
              fit: true,
              'cursor-pointer': true,
              'a-positive': props.row.implementsAbstraction === true,
              'a-negative': props.row.implementsAbstraction === false,
              'a-neutral': props.row.implementsAbstraction === null,
            }"
            @click="onRowClick(props.row)"
          >
            <q-card-section>
              <div class="text-h6">
                {{ formatDate(props.row.date, 'dddd, MMMM DD, YYYY') }}
              </div>
              <div class="text-subtitle text-grey">
                at {{ formatDate(props.row.date, 'HH:mm:ss') }}
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div v-html="props.row.description"></div>
            </q-card-section>
            <q-separator class="q-mt-auto" />
            <q-card-section class="row justify-between">
              <div>
                <q-icon
                  :name="
                    props.row.abstractionId
                      ? 'task_alt'
                      : 'radio_button_unchecked'
                  "
                  left
                  class="q-mr-xs"
                />
                <span
                  v-html="
                    props.row.abstractionId ? 'Abstracted' : 'Not abstracted'
                  "
                />
              </div>
              <q-icon
                :name="
                  props.cols[3].value === true
                    ? 'thumb_up'
                    : props.cols[3].value === false
                    ? 'thumb_down'
                    : 'thumbs_up_down'
                "
                :color="
                  props.cols[3].value === true
                    ? 'positive'
                    : props.cols[3].value === false
                    ? 'negative'
                    : 'orange'
                "
              />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { date } from 'quasar'
import { db } from 'boot/db'
import { standardizeText } from 'boot/utils'

const { formatDate } = date
const pagination = ref({
  sortBy: 'date',
  descending: true,
  rowsPerPage: 0, // 0 means all
})
const rowsPerPageOptions = [5, 10, 20, 50, 100]
const columns = [
  {
    label: 'Date',
    name: 'date',
    field: (row) => row.date,
    format: (value) => value,
    sortable: true,
  },
  {
    label: 'Description',
    name: 'description',
    field: (row) => row.description,
    format: (value) => value.substring(0, 100),
  },
  {
    label: 'Abstracted',
    name: 'abstractionId',
    field: (row) => row.abstractionId,
    format: (value) => value,
  },
  {
    label: 'Implements abstraction?',
    name: 'implementsAbstraction',
    field: (row) => row.implementsAbstraction,
    format: (value) => value,
  },
]
const rows = ref([])
const options = ref(['All', 'Not yet abstracted', 'Not yet rated'])
const filter = ref({
  search: '',
  showAbstracted: 'All',
})

db.reflections.toArray().then((reflections) => {
  rows.value = reflections
})

/**
 * Showing
 * - all reflections
 * - abstracted reflections
 * - not yet abstracted reflections
 */
function filterBy(rows) {
  return rows.filter((row) => {
    if (filter.value.search) {
      const search = standardizeText(filter.value.search)
      const description = standardizeText(row.description)
      if (!description.includes(search)) {
        return false
      }
    }
    switch (filter.value.showAbstracted) {
      case 'All':
        return true
      // case 'Already abstracted':
      //   return row.abstractionId !== null
      case 'Not yet abstracted':
        return row.abstractionId === null
      case 'Not yet rated':
        return row.implementsAbstraction === null
      default:
        return true
    }
  })
}

const router = useRouter()
const onRowClick = (row) => router.push(`/reflections/${row.id}/edit`)
</script>

<style lang="sass">
.a-positive
  background: linear-gradient(225deg, transparentize($green-10, .5), transparentize($green-10, .9))
.a-negative
  background: linear-gradient(225deg, transparentize($red-10, .65), transparentize($red-10, .9))
.a-neutral
  background: linear-gradient(225deg, transparentize($amber-10, .65), transparentize($amber-10, .95))
</style>
