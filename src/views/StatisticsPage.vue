<template>
  <div class="statistics-page-wrap">
    <div class="statistics-cont" :class="{ show: size < 767 }">
      <div class="statistics-nav">
        <button
          type="button"
          class="btn-sta-nav"
          v-for="(date, idx) in dateFn"
          @click.prevent="handleClicked(idx)"
          :class="{ on: selectedTab === idx }"
          :key="idx"
        >
          {{ date }}
        </button>
      </div>
      <RoundGraph :selected-tab="selectedTab" :size="size"></RoundGraph>
      <BarGraph :selected-tab="selectedTab" :size="size"></BarGraph>
    </div>
  </div>
</template>

<script>
import BarGraph from '@/components/statistics/BarGraph.vue';
import RoundGraph from '@/components/statistics/RoundGraph.vue';

import { todayCheck, yearCheck } from '../utils/statistics.js';

export default {
  data() {
    return {
      dateFn: [`${this.whatMonth()}월`, this.whatYear()],
      selectedTab: 0,
      size: window.innerWidth,
    };
  },
  components: {
    BarGraph,
    RoundGraph,
  },

  created() {
    console.log(this.$parent);
    console.log(this.$root);
    this.$parent.loadingStatus = false;
    window.addEventListener('resize', e => (this.size = e.target.innerWidth));
  },
  methods: {
    whatMonth() {
      return todayCheck();
    },
    whatYear() {
      return yearCheck();
    },
    handleClicked(tabNum) {
      this.selectedTab = tabNum;
    },
  },
};
</script>

<style scoped>
.statistics-nav {
  display: none;
  justify-content: flex-end;
  position: static;
  padding: 0;
}

.statistics-cont.show .statistics-nav {
  display: flex;
}

.statistics-cont.show .btn-sta-nav:first-child {
  margin-right: 2px;
}
.statistics-cont.show .btn-sta-nav.on {
  color: #287457;
}
.statistics-cont.show .btn-sta-nav.on::after {
  background-color: #348f6c;
}
.statistics-cont.show .btn-sta-nav {
  position: relative;
  background-color: transparent;
  border: none;
  padding: 5px 9px;
  font-weight: 800;
  color: rgba(128, 128, 128, 0.589);
  font-family: 'Jua';
  font-size: 18px;
}
.statistics-cont.show .btn-sta-nav::after {
  content: '';
  position: absolute;
  height: 3px;
  width: calc(100% - 12px);
  background-color: rgba(128, 128, 128, 0.589);
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.6;
  border-radius: 20px;
}
.statistics-cont.show > .bar-graph-cont,
.statistics-cont.show > .round-graph-cont {
  display: none;
}
.statistics-cont.show > .bar-graph-cont.on,
.statistics-cont.show > .round-graph-cont.on {
  display: block;
}
</style>
