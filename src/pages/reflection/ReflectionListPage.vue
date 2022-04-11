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
      :binary-state-sort="true"
      :pagination="pagination"
      :rows-per-page-options="rowsPerPageOptions"
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
            v-if="rows.length > 0"
            rounded
            outlined
            v-model="showAbstracted"
            :options="options"
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
import { db } from '../../db'

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
    format: (value) => date.formatDate(value, 'D MMM YYYY HH:mm'),
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
    format: (value) => (value === true ? 'Yes' : value === false ? 'No' : '?'),
  },
]
const rows = ref([])
const options = ref(['All', 'Already abstracted', 'Not yet abstracted'])
// const showAbstracted = ref('Not yet abstracted')
const showAbstracted = ref('All')

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
    switch (showAbstracted.value) {
      case 'All':
        return true
      case 'Already abstracted':
        return row.abstractionId !== null
      case 'Not yet abstracted':
        return row.abstractionId === null
      default:
        return true
    }
  })
}

const router = useRouter()
const onRowClick = (evt, row) => router.push(`/reflections/${row.id}/edit`)
</script>

<style lang="sass">
th:not(.sortable)
  display: none
</style>
