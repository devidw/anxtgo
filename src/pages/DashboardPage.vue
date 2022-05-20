<template>
  <q-page padding>
    <div
      class="row fit"
      :class="{
        'q-gutter-md': $q.screen.gt.xs,
        'q-gutter-y-md': $q.screen.lt.md,
        'justify-center': $q.screen.lt.md,
      }"
    >
      <q-card>
        <q-card-section>
          <div class="text-h6 text-center">Abstracted</div>
        </q-card-section>
        <q-card-section>
          <AAbstractedDoughnut
            v-if="abstractedData.length === 2"
            :data="abstractedData"
          />
        </q-card-section>
      </q-card>
      <q-card>
        <q-card-section>
          <div class="text-h6 text-center">Abstraction implementation</div>
        </q-card-section>
        <q-card-section>
          <AImplementationRadar
            v-if="implementationRadarData.length === 3"
            :data="implementationRadarData"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'boot/db'
import AAbstractedDoughnut from 'components/AAbstractedDoughnut'
import AImplementationRadar from 'components/AImplementationRadar'

const abstractedData = ref([])
const implementationRadarData = ref([])

/**
 *
 */
;(() => {
  db.reflections
    .where('abstractionId')
    .above(0)
    .count()
    .then((count) => {
      abstractedData.value[0] = count
    })
    .then(() => {
      db.reflections.count().then((count) => {
        abstractedData.value[1] = count - abstractedData.value[0]
      })
    })
})()

/**
 *
 */
;(() => {
  db.reflections.toArray().then((reflections) => {
    const successful = reflections.filter((reflection) => {
      return reflection.implementsAbstraction
    }).length

    const unsuccessful = reflections.filter((reflection) => {
      return !reflection.implementsAbstraction
    }).length

    const unknown = reflections.filter((reflection) => {
      return reflection.implementsAbstraction === null
    }).length

    implementationRadarData.value = [unknown, successful, unsuccessful]
  })
})()
</script>
