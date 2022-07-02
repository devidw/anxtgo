<template>
  <q-page padding>
    <q-table
      grid
      grid-header
      :title="$t('reflection', 2)"
      :rows="rows"
      :columns="columns"
      :filter="storeFilter.filter"
      :filter-method="filterBy"
      row-key="name"
      :binary-state-sort="true"
      :pagination="pagination"
      :rows-per-page-options="rowsPerPageOptions"
    >
      <template v-slot:top-left>
        <q-btn
          to="/reflections/add"
          icon="las la-plus"
          color="primary"
          outline
          round
        />
      </template>

      <template v-slot:top-right v-if="rows.length > 0">
        <div class="fit row wrap">
          <a-search v-model="storeFilter.filter.search" class="q-mr-sm" />

          <q-select
            v-model="storeFilter.filter.showAbstracted"
            :options="options"
            rounded
            outlined
            dense
          />
        </div>
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        >
          <q-card
            class="fit column"
            :class="{
              'cursor-pointer': true,
              'a-bg-positive': props.row.implementsAbstraction === true,
              'a-bg-negative': props.row.implementsAbstraction === false,
              'a-bg-neutral': props.row.implementsAbstraction === null,
            }"
            @click="onRowClick(props.row)"
          >
            <q-card-section>
              <div class="text-h6">
                {{ formatDate(props.row.date, 'dddd, MMMM DD, YYYY') }}
              </div>
              <div class="a-heading text-grey">
                at {{ formatDate(props.row.date, 'HH:mm:ss') }}
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none a-card__description">
              <p>{{ props.cols[1].value }}</p>
            </q-card-section>
            <q-separator class="q-mt-auto" />
            <q-card-section class="row justify-between items-center">
              <div>
                <q-icon
                  :name="
                    props.row.abstractionId
                      ? 'las la-check-circle'
                      : 'las la-times-circle'
                  "
                  left
                  class="q-mr-xs"
                />
                <small
                  v-html="
                    props.row.abstractionId ? 'Abstracted' : 'Not abstracted'
                  "
                />
              </div>
              <q-icon
                :name="
                  props.cols[3].value === true
                    ? 'o_thumb_up'
                    : props.cols[3].value === false
                    ? 'o_thumb_down'
                    : 'o_thumbs_up_down'
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
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { date } from 'quasar'
import { db } from 'boot/db'
import { stripHtml, standardizeText } from 'boot/utils'
import ASearch from 'components/ASearch.vue'
import { useReflectionListStore } from 'stores/reflectionList'

const { t } = useI18n()
const { formatDate } = date
const pagination = ref({
  sortBy: 'date',
  descending: true,
  rowsPerPage: 0, // 0 means all
})
const options = ref(['All', 'Not yet abstracted', 'Not yet rated'])
const storeFilter = useReflectionListStore()
const rowsPerPageOptions = [5, 10, 20, 50, 100]
const rows = ref([])
const columns = [
  {
    label: t('date'),
    name: 'date',
    field: (row) => row.date,
    format: (value) => value,
    sortable: true,
  },
  {
    label: 'Description',
    name: 'description',
    field: (row) => row.description,
    format: (value) =>
      value
        ? stripHtml(value).substring(0, 160) + (value.length > 160 ? '…' : '')
        : '',
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
    if (storeFilter.filter.search) {
      const search = standardizeText(storeFilter.filter.search)
      const description = standardizeText(row.description)
      if (!description.includes(search)) {
        return false
      }
    }
    switch (storeFilter.filter.showAbstracted) {
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

<style lang="sass"></style>
