<template>
  <q-page padding>
    <q-timeline
      :layout="layout"
      dark
      class="q-pl-lg q-pl-sm-none"
      :class="{ 'a-smaller': $q.screen.gt.sm }"
    >
      <q-timeline-entry heading>
        {{ abstraction.title }}
        <br v-if="abstraction.title" />
        {{ rating > 0 ? `+${rating}` : rating }}
      </q-timeline-entry>

      <q-timeline-entry icon="las la-plus" class="a-add-entry">
        <div class="q-mb-xl" />
      </q-timeline-entry>

      <q-timeline-entry
        v-for="(station, index) in stations"
        :key="index"
        side="right"
        :title="formatDateDefault(station.date)"
        :subtitle="isReflection(station) ? 'Reflection' : 'Abstraction'"
        :icon="
          isReflection(station)
            ? isPos(station) === true
              ? 'o_thumb_up'
              : isPos(station) === false
              ? 'o_thumb_down'
              : 'o_thumbs_up_down'
            : 'psychology'
        "
        :color="
          isReflection(station)
            ? isPos(station) === true
              ? 'positive'
              : isPos(station) === false
              ? 'negative'
              : 'orange'
            : 'info'
        "
      >
        <div class="q-mb-md">
          <p>
            <span v-html="station.description" />
            <q-btn
              flat
              rounded
              dense
              size="sm"
              icon="las la-pen"
              color="grey"
              class="q-ml-xs"
              @click="goToEdit(station)"
            />
          </p>
        </div>
        <div class="q-mb-xl"></div>
      </q-timeline-entry>
    </q-timeline>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAbstractionRating } from './rating'
import { db } from 'boot/db'
import { formatDateDefault } from 'boot/utils'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const id = Number(route.params.id)
const abstraction = ref({})
const stations = ref([])
const layout = computed(() => {
  return $q.screen.lt.sm ? 'dense' : $q.screen.lt.md ? 'comfortable' : 'loose'
})
const rating = ref(0)
useAbstractionRating(id).then((r) => (rating.value = r))

/**
 * Get all reflection, which are linked to the current abstraction
 */
db.reflections
  .where({ abstractionId: id })
  .toArray()
  .then((docs) => {
    const linked = docs.filter((doc) => doc.abstractionId === id)
    stations.value = linked
  })
  /**
   * Also add the current abstraction itself
   */
  .then(() => {
    db.abstractions
      .get(id)
      .then((doc) => {
        abstraction.value = doc
        stations.value.push(doc)
      })
      /**
       * Sort all reflections and abstractions by date
       */
      .then(() => {
        stations.value.sort((a, b) => {
          return new Date(b.date) - new Date(a.date)
        })
      })
  })

const isReflection = (doc) => doc.abstractionId === id
const isPos = (doc) => doc.implementsAbstraction

/**
 * Go to the edit page of the passed station, either a reflection or abstraction
 */
const goToEdit = (station) => {
  if (isReflection(station)) {
    router.push(`/reflections/${station.id}/edit`)
    return
  }
  router.push(`/abstractions/${station.id}/edit`)
}

onMounted(() => {
  /**
   * Manually set the click handler for the add button since there is no way to configure the quasar timeline entry to have a click event
   */
  ;(() => {
    document.querySelector('.a-add-entry .q-timeline__dot i').onclick = () => {
      router.push({
        path: '/reflections/add',
        query: { abstractionId: id },
      })
    }
  })()
})
</script>

<style lang="sass">
.a-smaller
  width: 80%

.a-add-entry .q-timeline__dot i
  cursor: pointer
</style>
