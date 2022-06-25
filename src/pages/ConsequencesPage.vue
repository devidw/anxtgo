<template>
  <q-page padding>
    <h1 class="text-h5" v-html="$t('consequences')" />

    <q-table :columns="columns" :rows="rows" row-key="id" grid hide-pagination>
      <template v-slot:top-left>
        <q-btn
          @click="addRow"
          icon="las la-plus"
          color="primary"
          outline
          round
        />
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
        >
          <q-card class="fit column">
            <q-card-section>
              <div class="text-h6">
                {{ props.row.name }}
              </div>
              <div class="text-grey a-heading">
                {{ props.row.unit }}
                {{ props.row.symbol }}
              </div>
            </q-card-section>

            <q-separator class="q-mt-auto" />

            <q-card-actions class="row justify-between">
              <div>
                <q-btn
                  @click="onEditClick(props.row)"
                  icon="las la-pen"
                  color="grey"
                  flat
                  rounded
                />
                <q-btn
                  @click="onDelClick(props.row)"
                  icon="las la-trash"
                  color="grey"
                  flat
                  rounded
                />
              </div>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>

    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Edit consequence</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="current.name" label="Name" />
          <q-select
            v-model="current.type"
            label="Type"
            :options="typeOptions"
          />
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
            @click="editRow"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <a-dialog-delete v-model="showDeleteDialog" :callback="delRow" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'boot/db'
import ADialogDelete from 'components/ADialogDelete.vue'

const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
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
  showEditDialog.value = true
}

const onEditClick = (row) => {
  current.value = Object.assign({}, row)
  showEditDialog.value = true
}

const editRow = () => {
  db.consequences.update(current.value.id, current.value)
  rows.value = rows.value.map((row) =>
    row.id === current.value.id ? current.value : row
  )
  showEditDialog.value = false
  current.value = null
}

const onDelClick = (row) => {
  current.value = row
  showDeleteDialog.value = true
}

const delRow = async () => {
  await db.consequences.delete(current.value.id)
  rows.value = rows.value.filter((row) => row.id !== current.value.id)
  showDeleteDialog.value = false
  current.value = null
}
</script>
