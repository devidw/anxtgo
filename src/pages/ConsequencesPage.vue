<template>
  <q-page padding>
    <h2 class="text-h5" v-html="$t('consequences')" />

    <q-table
      :columns="columns"
      :rows="rows"
      row-key="id"
      selection="multiple"
      v-model:selected="selected"
      @row-click="onRowClick"
    >
      <template v-slot:top-left>
        <q-btn
          @click="addRow"
          icon="las la-plus"
          color="primary"
          outline
          round
          dense
        />
        <q-btn
          v-if="selected.length"
          class="q-ml-sm"
          @click="delRows"
          icon="las la-minus"
          color="primary"
          outline
          round
          dense
        />
      </template>
    </q-table>

    <q-dialog v-model="editing" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Edit consequence</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="current.name" label="Name" />
          <q-select v-model="current.type" label="Type" :options="types" />
          <q-input v-model="current.unit" label="Unit" />
          <q-input v-model="current.symbol" label="Symbol" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            v-close-popup
            @click="saveRow"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'boot/db'

const editing = ref(false)
const current = ref(null)
const selected = ref([])
const rows = ref([])
const typeOptions = ref([
  {
    label: 'Number',
    value: 'number',
  },
])
const columns = [
  {
    name: 'name',
    label: 'Name',
    align: 'left',
    field: (row) => row.name,
  },
  {
    name: 'type',
    label: 'Type',
    align: 'left',
    field: (row) => row.type,
  },
  {
    name: 'unit',
    label: 'Unit',
    align: 'left',
    field: (row) => row.unit,
  },
  {
    name: 'symbol',
    label: 'Symbol',
    align: 'left',
    field: (row) => row.symbol,
  },
]

/**
 * Self executing async function to get the data from the database.
 */
;(async () => {
  rows.value = await db.consequences.toArray()
})()

const onRowClick = (evt, row, index) => {
  current.value = Object.assign({}, row)
  editing.value = true
}

const addRow = async () => {
  const id = await db.consequences.add({
    name: '',
    type: 'number',
    unit: '',
    symbol: '',
  })
  const consequence = await db.consequences.get(id)
  rows.value = [...rows.value, consequence]
  current.value = Object.assign({}, consequence)
  editing.value = true
}

const delRows = async () => {
  const keys = selected.value.map((row) => row.id)
  await db.consequences.bulkDelete(keys)
  rows.value = rows.value.filter((row) => !keys.includes(row.id))
  selected.value = []
}

const saveRow = () => {
  db.consequences.update(current.value.id, current.value)
  rows.value = rows.value.map((row) =>
    row.id === current.value.id ? current.value : row
  )
  editing.value = false
}
</script>
