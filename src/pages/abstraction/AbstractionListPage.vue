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

const router = useRouter()
const db = new Localbase('db')
const columns = [
  {
    label: 'Sort by date',
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
]
const rows = ref([])

db.collection('abstractions')
  .get()
  .then((abstractions) => (rows.value = abstractions))

function onRowClick(evt, row) {
  router.push({ path: `/abstractions/${row.id}/edit` })
}
</script>

<style lang="sass">
th:not(.sortable)
  display: none
</style>
