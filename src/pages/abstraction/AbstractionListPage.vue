<template>
  <q-page padding>
    <q-table
      grid
      grid-header
      title="Abstractions"
      :rows="rows"
      :columns="columns"
      row-key="name"
      binary-state-sort
      :pagination="pagination"
      :rows-per-page-options="rowsPerPageOptions"
      :filter="filter"
      :filter-method="filterBy"
    >
      <template v-slot:top-left>
        <div class="q-gutter-sm">
          <q-btn
            :label="$t('add')"
            color="primary"
            icon="add"
            outline
            rounded
            to="/abstractions/add"
          />
        </div>
      </template>

      <template v-slot:top-right v-if="rows.length > 0">
        <q-input
          rounded
          outlined
          dense
          debounce="300"
          v-model="filter"
          :placeholder="$t('search')"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        >
          <q-card
            @click="onRowClick(props.row)"
            :class="{
              column: true,
              fit: true,
              'cursor-pointer': true,
              'a-bg-positive': props.row.rating > 0,
              'a-bg-neutral': props.row.rating === 0,
              'a-bg-negative': props.row.rating < 0,
            }"
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
import { standardizeText } from 'boot/utils'

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
const filter = ref('')

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

const filterBy = (rows) => {
  if (!filter.value.search) {
    return true
  }
  return rows.filter((row) => {
    const search = standardizeText(filter.value)
    const description = standardizeText(row.description)
    return description.includes(search)
  })
}
</script>

<style lang="sass"></style>
