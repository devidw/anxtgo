<template>
  <div></div>
</template>

<script>
import { defineComponent, h } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  // Legend,
  Tooltip,
  ArcElement,
  CategoryScale,
} from 'chart.js'
import { colors } from 'quasar'

const { getPaletteColor } = colors

ChartJS.register(Tooltip, ArcElement, CategoryScale)

export default defineComponent({
  name: 'AAbstractedDoughnut',
  props: {
    data: {
      type: Array,
    },
    chartId: {
      type: String,
      default: 'doughnut-chart',
    },
    width: {
      type: Number,
      default: 300,
    },
    height: {
      type: Number,
      default: 300,
    },
    cssClasses: {
      default: '',
      type: String,
    },
    styles: {
      type: Object,
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const chartData = {
      labels: ['Abstracted', 'Not abstracted'],
      datasets: [
        {
          data: props.data,
          // borderWidth: 1,
          // backgroundColor: [
          borderColor: [
            getPaletteColor('primary'),
            getPaletteColor('grey'),
          ],
        },
      ],
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {},
      layout: {
        padding: 20,
      },
    }

    return () =>
      h(Doughnut, {
        chartData,
        chartOptions,
        chartId: props.chartId,
        width: props.width,
        height: props.height,
        cssClasses: props.cssClasses,
        styles: props.styles,
        plugins: props.plugins,
      })
  },
})
</script>
