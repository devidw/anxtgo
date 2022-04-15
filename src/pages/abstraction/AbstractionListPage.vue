<template>
  <q-page padding>
    <q-table
      grid
      grid-header
      title="Abstractions"
      :rows="rows"
      :columns="columns"
      row-key="name"
      @row-click="onRowClick"
      :binary-state-sort="true"
      :pagination="pagination"
      :rows-per-page-options="rowsPerPageOptions"
    >
      <template v-slot:top>
        <div class="q-gutter-sm">
          <q-btn
            label="Add"
            color="primary"
            icon="add"
            outline
            rounded
            to="/abstractions/add"
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
import { useAbstractionRating } from './rating'
import { db } from 'boot/db'
import { stripHtml, formatDateDefault } from 'boot/utils'

const pagination = ref({
  sortBy: 'rating',
  descending: false,
  rowsPerPage: 0, // 0 means all
})
const rowsPerPageOptions = [5, 10, 20, 50, 100]
const columns = [
  {
    label: 'Date',
    name: 'date',
    field: (row) => row.date,
    format: (value) => formatDateDefault(value),
    // align: 'left',
    sortable: true,
  },
  {
    label: 'Description',
    name: 'description',
    field: (row) => stripHtml(row.description),
    format: (value) => value.substring(0, 100),
  },
  {
    label: 'Rating',
    name: 'rating',
    field: (row) => row.rating,
    format: (value) => (value > 0 ? `+${value}` : value),
    sortable: true,
  },
]
const rows = ref([])

db.abstractions
  .toArray()
  .then((abstractions) => {
    rows.value = abstractions
  })
  /**
   * Bulk calculate, await and apply ratings to the table rows
   */
  .then(() => {
    rows.value.map((abstraction) => {
      useAbstractionRating(abstraction.id).then((rating) => {
        abstraction.rating = rating
      })
    })
  })

const router = useRouter()
const onRowClick = (evt, row) => router.push(`/abstractions/${row.id}`)
</script>

<style lang="sass">
th:not(.sortable)
  display: none
</style>
