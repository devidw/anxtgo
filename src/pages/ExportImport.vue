<template>
  <q-page padding>
    <div class="q-mb-xl">
      <h2 class="text-h5">Export</h2>
      <q-btn
        outline
        rounded
        color="primary"
        icon="las la-download"
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
          outline
          rounded
          color="primary"
          icon="las la-upload"
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

async function onExport() {
  const blob = await db.export({ prettyJson: true })
  await download(blob, 'learnings.json', 'application/json')
  $q.notify({
    type: 'positive',
    message: 'Export successful',
  })
}

/**
 * First delete the existing database
 * Then import the uploaded data into the database
 */
async function onImport() {
  const blob = importFile.value

  if (!blob) {
    return
  }

  try {
    await db.delete()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to delete existing database',
    })
    console.error(err)
    return
  }

  $q.notify({
    type: 'positive',
    message: 'Deleted existing database successfully',
  })

  try {
    await Dexie.import(blob)
    // Reopen the database connection after the database was deleted and imported.
    db.open()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to import data',
    })
    console.error(err)
    return
  }

  $q.notify({
    type: 'positive',
    message: 'Imported data successfully',
  })
}
</script>
