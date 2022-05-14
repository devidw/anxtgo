<template>
  <q-input outlined dense input-class="text-center" readonly>
    <template v-slot:prepend>
      <q-icon name="las la-calendar-day" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date mask="YYYY-MM-DD HH:mm:ss">
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                icon="las la-check"
                color="primary"
                flat
                rounded
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>

    <template v-slot:append>
      <q-icon name="las la-clock" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time mask="YYYY-MM-DD HH:mm:ss" format24h with-seconds>
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                icon="las la-check"
                color="primary"
                flat
                rounded
              />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
</script>

