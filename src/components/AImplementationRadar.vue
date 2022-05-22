<template>
  <div></div>
</template>

<script>
import { defineComponent, h } from 'vue'
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  // Title,
  Tooltip,
  // Legend,
  PointElement,
  RadialLinearScale,
  LineElement,
  // Plugin,
} from 'chart.js'
import { colors } from 'quasar'

const { getPaletteColor } = colors

ChartJS.register(
  // Title,
  Tooltip,
  // Legend,
  PointElement,
  RadialLinearScale,
  LineElement
)

export default defineComponent({
  name: 'AImplementationRadar',
  // components: {
  //   Radar,
  // },
  props: {
    datasets: {
      type: Array,
    },
    chartId: {
      type: String,
      default: 'radar-chart',
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
      labels: [
        '', // 'Unknown',
        '', // 'Implements abstraction',
        '', // "Doesn't implement abstraction",
      ],
      datasets: props.datasets.map((dataset) => {
        // dataset.borderColor = getPaletteColor('primary')
        return dataset
      }),
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          // suggestedMin: 50,
          // suggestedMax: 100,
          pointLabels: {
            color: 'white',
            font: {
              family: 'Line Awesome Free',
              size: 20,
            },
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.35)',
          },
          ticks: {
            display: false,
          },
          angleLines: {
            // display: false,
            color: 'rgba(255, 255, 255, 0.35)',
          },
        },
      },
      plugins: {
        tooltip: {
          titleFont: {
            family: 'Line Awesome Free',
            size: 20,
          },
          backgroundColor: getPaletteColor('grey'),
          displayColors: false,
          callbacks: {
            title: () => {
              return ''
            },
            label: (context) => {
              return `${context.parsed.r} ${context.dataset.label}`
            },
          },
        },
      },
    }

    return () =>
      h(Radar, {
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
