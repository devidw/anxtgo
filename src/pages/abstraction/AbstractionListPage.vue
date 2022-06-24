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
      :filter="storeSearch.search"
      :filter-method="filterBy"
    >
      <template v-slot:top-left>
        <div class="q-gutter-sm">
          <q-btn
            to="/abstractions/add"
            icon="las la-plus"
            color="primary"
            outline
            round
          />
        </div>
      </template>

      <template v-slot:top-right v-if="rows.length > 0">
        <a-search v-model="storeSearch.search" />
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        >
          <q-card
            class="fit column"
            :class="{
              'a-bg-positive': props.row.rating > 0,
              'a-bg-neutral': props.row.rating === 0,
              'a-bg-negative': props.row.rating < 0,
            }"
          >
            <q-card-section>
              <div class="text-h6">
                {{ props.row.title }}
              </div>
              <div class="text-grey a-heading">
                {{ formatDate(props.row.date, 'dddd, MMMM DD, YYYY') }}
                at {{ formatDate(props.row.date, 'HH:mm:ss') }}
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none a-card__description">
              <p>{{ props.cols[2].value }}</p>
            </q-card-section>

            <q-separator class="q-mt-auto" />

            <q-card-actions class="row justify-between">
              <div>
                <q-btn
                  :to="`/abstractions/${props.row.id}`"
                  icon="las la-history"
                  color="grey"
                  flat
                  rounded
                />
                <q-btn
                  :to="`/abstractions/${props.row.id}/edit`"
                  icon="las la-pen"
                  color="grey"
                  flat
                  rounded
                />
                <q-btn
                  :to="`/abstractions/add?abstractionId=${props.row.id}`"
                  icon="las la-plus"
                  color="grey"
                  flat
                  rounded
                />
              </div>

              <div class="text-bold text-right q-pr-md a-heading">
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
            </q-card-actions>
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
import { stripHtml, standardizeText } from 'boot/utils'
import ASearch from 'components/ASearch.vue'
import { useAbstractionListStore } from 'stores/abstractionList'

const { formatDate } = date
const pagination = ref({
  sortBy: 'rating',
  descending: false,
  rowsPerPage: 0, // 0 means all
})
const rowsPerPageOptions = [5, 10, 20, 50, 100]
const rows = ref([])
const storeSearch = useAbstractionListStore()
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
    label: 'Title',
    name: 'title',
    field: (row) => row.title,
    format: (value) => value,
  },
  {
    label: 'Description',
    name: 'description',
    field: (row) => row.description,
    format: (value) =>
      stripHtml(value).substring(0, 160) + (value.length > 160 ? '…' : ''),
  },
  {
    label: 'Rating',
    name: 'rating',
    field: (row) => row.rating,
    format: (value) => value,
    sortable: true,
  },
]

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

const filterBy = (rows) => {
  if (!storeSearch.search) {
    return true
  }
  return rows.filter((row) => {
    const search = standardizeText(storeSearch.search)
    const description = standardizeText(row.title + row.description)
    return description.includes(search)
  })
}
</script>

<style lang="sass"></style>
