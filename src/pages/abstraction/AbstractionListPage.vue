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
import Localbase from 'localbase'
import { useAbstractionRating } from './rating'

const router = useRouter()
const db = new Localbase('db')
const columns = [
  {
    label: 'Date',
    name: 'date',
    field: (row) => row.date,
    format: (value) => date.formatDate(value, 'D MMM YYYY'),
    // align: 'left',
    sortable: true,
  },
  {
    label: 'Description',
    name: 'description',
    field: (row) => row.description,
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

db.collection('abstractions')
  .get()
  .then((abstractions) => (rows.value = abstractions))
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

function onRowClick(evt, row) {
  router.push({ path: `/abstractions/${row.id}` })
}
</script>

<style lang="sass">
th:not(.sortable)
  display: none
</style>
