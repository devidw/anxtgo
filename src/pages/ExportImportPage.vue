<template>
  <q-page padding>
    <div class="q-mb-xl">
      <h2 class="text-h5">Export</h2>
      <q-btn
        label="Export"
        outline
        rounded
        color="primary"
        icon="download"
        @click="onExport"
      />
    </div>
    <div class="">
      <h2 class="text-h5">Import</h2>
      <div class="q-gutter-md row">
        <q-file
          v-model="importFile"
          label="Pick one file"
          accept=".json"
          outlined
          rounded
          dense
          style="max-width: 300px"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" @click.stop />
          </template>
          <template v-slot:append v-if="importFile">
            <q-icon
              name="close"
              @click.stop="importFile = null"
              class="cursor-pointer"
            />
          </template>
        </q-file>
        <q-btn
          label="Import"
          outline
          rounded
          color="primary"
          icon="upload"
          @click="onImport"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { Dexie } from 'dexie'
import 'dexie-export-import'
import download from 'downloadjs'
import { db } from '../boot/db'

const $q = useQuasar()
const importFile = ref(null)

const onExport = async () => {
  db.export({ prettyJson: true })
    .then((blob) => {
      download(blob, 'learnings.json', 'application/json')
    })
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Export successful',
      })
    })
}

/**
 * First delete the existing database, then import the uploaded data into the database.
 */
const onImport = async () => {
  const blob = importFile.value
  if (!blob) {
    return
  }
  db.delete()
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Deleted existing database successfully',
      })
    })
    .then(() => {
      Dexie.import(blob)
        .then(() => {
          // Reopen the database connection after it was deleted and imported.
          db.open()
        })
        .then(() => {
          $q.notify({
            type: 'positive',
            message: 'Imported data successfully',
          })
        })
        .catch((err) => {
          $q.notify({
            type: 'negative',
            message: 'Failed to import data',
          })
          console.error(err)
        })
    })
    .catch((err) => {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete existing database',
      })
      console.error(err)
    })
}
</script>
