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

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        >
          <q-card class="column fit" @click="onRowClick(props.row)">
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
            <q-card-section class="row justify-end">
              <div class="text-bold">
                <div
                  :class="
                    props.row.rating > 0
                      ? 'text-positive'
                      : props.row.rating < 0
                      ? 'text-negative'
                      : 'text-orange'
                  "
                >
                  {{ props.row.rating > 0 ? '+' : '' }}{{ props.row.rating }}
                  <!-- <q-icon name="trending_up" /> -->
                </div>
              </div>
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
import { useAbstractionRating } from './rating'
import { db } from 'boot/db'
import { stripHtml, formatDateDefault } from 'boot/utils'

const { formatDate } = date
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
    format: (value) => value,
    // align: 'left',
    sortable: true,
  },
  {
    label: 'Description',
    name: 'description',
    field: (row) => row.description,
    format: (value) => value,
  },
  {
    label: 'Rating',
    name: 'rating',
    field: (row) => row.rating,
    format: (value) => value,
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
const onRowClick = (row) => router.push(`/abstractions/${row.id}`)
</script>

<style lang="sass"></style>
