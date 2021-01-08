<template>
  <div class="round-graph-cont" :class="{ on: selectedTab === 0 }">
    <div class="round-graph">
      <h3>{{ whatMonth() }}월</h3>
      <div id="canvas-holder">
        <canvas ref="rGraph"></canvas>
      </div>
    </div>
    <ListOfMonth
      :bgColors="bgColor"
      :selectedChart="selectedChart"
      :selectedNum="selectedNum"
      :hbgColors="hBgColor"
    ></ListOfMonth>
  </div>
</template>

<script>
import { todayCheck } from '@/utils/statistics.js';
import ListOfMonth from '@/components/statistics/ListOfMonth.vue';
import { eventBus } from '../../main';
import ChartDataLabels from 'chartjs-plugin-datalabels';

let roundData = null;
let myChart = null; // chart를 사용할수 있는 데이터가 들어있다.

export default {
  props: ['selectedTab', 'size'],
  components: {
    ListOfMonth,
  },
  data() {
    return {
      categoryList: {},
      percentage: [],
      selectedChart: '',
      selectedNum: 0,
      bgColor: [
        '#16A085',
        '#45B39D',
        '#73C6B6',
        '#A2D9CE',
        '#D0ECE7',
        '#E8F6F3',
        '#ECEDED',
      ],
      hBgColor: [
        '#cccb91',
        '#d2d29f',
        '#d9d8ad',
        '#dfdfba',
        '#e6e5c8',
        '#ececd6',
        '#f2f2e4',
        '#f9f9f1',
      ],
    };
  },
  created() {
    eventBus.$once('category-list', list => {
      this.categoryList = list;
      this.Percentage(this.categoryList);
      this.roundChartDataUpdate(myChart, roundData, this.categoryList);
    });
  },
  mounted() {
    const ctx = this.$refs.rGraph;

    this.$_Chart.defaults.global.defaultFontColor = '#3b3b3b';
    this.$_Chart.defaults.global.defaultFontFamily = 'Jua';
    roundData = {
      type: 'pie',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: this.bgColor,
            hoverBackgroundColor: this.hBgColor,
            borderWidth: 1,
            borderAlign: 'innner',
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: false,
        tooltips: {
          mode: 'point',
          callbacks: {
            label: (tooltipItem, data) => {
              let index = tooltipItem.index;
              return (tooltipItem.labels = data.labels[index]);
            },
          },
        },
        hover: { animationDuration: 0 },
        animation: {
          animateScale: true,
          duration: 1300,
        },
        // labels.plugin. chart.js
        plugin: [ChartDataLabels],
        plugins: {
          datalabels: {
            color: 'white',
            anchor: 'end',
            offset: '9',
            align: 'start',
            borderColor: '#fff',
            font: {
              weigth: 'bold',
              size: '15',
            },
            formatter: value => {
              return value + '%';
            },
          },
        },
        events: ['click'],
        onClick: this.clickHandler,
      },
    };

    myChart = new this.$_Chart(ctx, roundData);
  },
  computed: {
    whatMonth() {
      return todayCheck;
    },
  },
  methods: {
    // 각 지출 백분율 구하기
    Percentage(cList) {
      let pieP = [];
      let EPprice = [];
      let totalNum = 0;

      for (let key in cList) {
        let price = cList[key].price;
        totalNum += price;
        EPprice.push(price);
      }

      EPprice.sort((a, b) => b - a);
      EPprice.filter(el => pieP.push(Math.round((el / totalNum) * 100)));

      this.percentage = pieP;
    },

    // 차트 데이터와 라벨
    roundChartDataUpdate(myChart, roundData, cList) {
      roundData.data.datasets[0].data = this.percentage;

      for (let num in cList) {
        roundData.data.labels.push(cList[num].category);
      }

      myChart.update();
    },

    clickHandler(context, el) {
      try {
        let target = el[0]._model.label;

        if (target !== this.selectedChart) {
          this.selectedChart = target;
          this.selectedNum = el[0]._index;
        } else return;
      } catch (error) {
        this.selectedChart = '';
      }
    },
  },
};
</script>

<style></style>
