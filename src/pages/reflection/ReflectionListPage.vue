<template>
  <q-page padding>
    <q-table
      grid
      grid-header
      title="Reflections"
      :rows="rows"
      :columns="columns"
      :filter="showAbstracted"
      :filter-method="filterBy"
      row-key="name"
      @row-click="onRowClick"
    >
      <template v-slot:top>
        <div class="fit row justify-between">
          <q-btn
            label="Add"
            color="primary"
            icon="add"
            outline
            rounded
            to="/reflections/add"
          />
          <q-select
            rounded
            outlined
            v-model="showAbstracted"
            :options="options"
            label="Filter"
            style="min-width: 200px"
          />
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { date } from 'quasar'
import Localbase from 'localbase'

const router = useRouter()
const db = new Localbase('db')
const columns = [
  {
    label: 'Sort by date',
    name: 'date',
    field: (row) => row.date,
    format: (value) => date.formatDate(value, 'D MMM YYYY'),
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
    format: (value) => (value ? 'Yes' : 'No'),
  },
  {
    label: 'Implements abstraction?',
    name: 'implementsAbstraction',
    field: (row) => row.implementsAbstraction,
    format: (value) => (value ? 'Yes' : 'No'),
  },
]
const rows = ref([])
const options = ref(['All', 'Already abstracted', 'Not yet abstracted'])
const showAbstracted = ref('Not yet abstracted')

db.collection('reflections')
  .get()
  .then((reflections) => (rows.value = reflections))

/**
 * Go to detail page
 */
function onRowClick(evt, row) {
  router.push({ path: `/reflections/${row.id}/edit` })
}

/**
 * Showing
 * - all reflections
 * - abstracted reflections
 * - not yet abstracted reflections
 */
function filterBy(rows) {
  return rows.filter((row) => {
    if (showAbstracted.value === 'Already abstracted') {
      return row.abstractionId
    } else if (showAbstracted.value === 'Not yet abstracted') {
      return !row.abstractionId
    } else {
      return true
    }
  })
}
</script>

<style lang="sass">
th:not(.sortable)
  display: none
</style>
