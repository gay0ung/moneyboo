<template>
  <div class="bar-graph-cont" :class="{ on: selectedTab === 1 }">
    <div class="bar-graph">
      <h3>{{ whatYear }}</h3>
      <div id="canvas-holder">
        <canvas ref="bGraph"></canvas>
      </div>
    </div>

    <ListOfyears :bgColors="bgColor" :year="whatYear"></ListOfyears>
  </div>
</template>

<script>
import { yearCheck } from '@/utils/statistics.js';
import ListOfyears from '@/components/statistics/ListOfyears.vue';
import { eventBus } from '../../main.js';

let barData = null;
let myChart = null;

export default {
  props: ['selectedTab', 'size'],
  components: {
    ListOfyears,
  },
  data() {
    return {
      yearsExpend: {},
      bgColor: [
        '#E8F8F5',
        '#D1F2EB',
        '#A3E4D7',
        '#76D7C4',
        '#48C9B0',
        '#1ABC9C',
        '#17A589',
        '#148F77',
        '#117864',
        '#0E6251',
        '#0C5345',
        '#0A4236',
      ],
    };
  },
  created() {
    eventBus.$once('monthExpend', value => {
      this.yearsExpend = value;
      this.barChartDataUpdate(myChart, barData, this.yearsExpend);
    });
  },

  mounted() {
    var ctx = this.$refs.bGraph;

    this.$_Chart.defaults.global.defaultFontColor = '#3b3b3b';
    this.$_Chart.defaults.global.defaultFontFamily = 'Jua';

    barData = {
      type: 'horizontalBar',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            label: '2020년 지출내역',
            backgroundColor: this.bgColor,
            borderColor: this.backgroundColor,
            maxBarThickness: 40,
            borderWidth: 1.2,
            minBarThickness: 17,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: false,
        tooltips: {
          callbacks: {
            label: tooltipItem => {
              return (tooltipItem.labels = `${tooltipItem.xLabel} 원`);
            },
          },
        },
        animation: {
          animateScale: true,
          duration: 1500,
        },
        hover: false,
        plugins: {
          datalabels: {
            display: false,
          },
        },
      },
    };
    myChart = new this.$_Chart(ctx, barData);
  },
  computed: {
    whatYear() {
      return yearCheck();
    },
  },
  methods: {
    barChartDataUpdate(myChart, barData, yList) {
      for (let num in yList) {
        let month = yList[num].month;
        let monthExpend = yList[num].expend;

        barData.data.labels.push(`${month} 월`);
        barData.data.datasets[0].data.push(monthExpend);
      }
      myChart.update();
    },
  },
};
</script>

<style></style>
