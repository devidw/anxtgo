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
            v-if="implementationRadarData.length === 2"
            :datasets="implementationRadarData"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'boot/db'
import { useAbstractionRating } from './abstraction/rating'
import AAbstractedDoughnut from 'components/AAbstractedDoughnut'
import AImplementationRadar from 'components/AImplementationRadar'
import { colors } from 'quasar'

const { getPaletteColor } = colors

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
  /**
   * Reflections with implementation
   */
  const reflectionBased = async () => {
    const reflections = await db.reflections.toArray()

    let successful = 0
    let unsuccessful = 0
    let unknown = 0

    reflections.forEach((reflection) => {
      if (reflection.implementsAbstraction) {
        successful++
      } else if (reflection.implementsAbstraction === false) {
        unsuccessful++
      } else if (reflection.implementsAbstraction === null) {
        unknown++
      }
    })

    return [unknown, successful, unsuccessful]
  }

  /**
   *
   */
  const abstractionBased = async () => {
    const abstractions = await db.abstractions.toArray()

    let successful = 0
    let unsuccessful = 0
    let unknown = 0

    for (const abstraction of abstractions) {
      const rating = await useAbstractionRating(abstraction.id)

      if (rating > 0) {
        successful++
      } else if (rating < 0) {
        unsuccessful++
      } else {
        unknown++
      }
    }

    return [unknown, successful, unsuccessful]
  }

  reflectionBased().then((data) => {
    implementationRadarData.value.push({
      data: data,
      label: 'Reflections',
      borderColor: getPaletteColor('primary'),
    })
  })
  abstractionBased().then((data) => {
    implementationRadarData.value.push({
      data: data,
      label: 'Abstractions',
      borderColor: getPaletteColor('grey'),
    })
  })
})()
</script>
