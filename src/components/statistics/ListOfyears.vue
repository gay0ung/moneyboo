<template>
  <div id="yearList" class="statistics-list">
    <ul>
      <li v-for="(mon, idx) in yearsExpend" :key="idx">
        <b
          ><i :style="{ backgroundColor: bgColors[idx] }"></i
          >{{ mon.month }}월</b
        >
        <span>{{ addComma(mon.expend) }} 원</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { addComma } from '@/utils/filters';
import { moneybooRef } from '@/api/firestore';
import { eventBus } from '../../main';

export default {
  props: ['bgColors', 'year'],
  data() {
    return {
      currentUID: '',
      yearsList: [], // dailyList데이터
      yearsExpend: [],
    };
  },
  created() {
    this.currentUID = this.$store.state.uid;
    this.getDailyDB();
  },
  computed: {
    addComma() {
      return addComma;
    },
  },
  methods: {
    mBooRef() {
      return moneybooRef(this.currentUID);
    },
    getDailyDB() {
      this.mBooRef()
        .doc('daily')
        .collection('listAdd')
        .onSnapshot(snapShot => {
          snapShot.forEach(doc => {
            const whatYear = String(this.year).substring(2),
              yearListCheck = doc.id.substring(0, 2);
            if (whatYear === yearListCheck) {
              this.yearsList.push(doc.data().listData);
            }
          });
          this.calculateEP();
        });
    },

    // 1년 중 월별 총 지출
    calculateEP() {
      const yearsDB = this.yearsList;

      let flattened = yearsDB.reduce((acc, curr) => acc.concat(curr), []);
      console.log(flattened);
      let exArr = flattened.filter(exp => exp.item === 'expend');

      // 몇월인지 ?
      exArr.map(el => {
        el.date =
          el.date.length > 4 ? el.date.substr(0, 2) : el.date.substr(0, 1);
      });

      // 각 월별 총 지출
      let monthTotal = exArr.reduce((acc, crr) => {
        const key = crr.date;

        if (!acc[key]) {
          acc[key] = {
            month: crr.date,
            expend: Number(crr.price),
          };
        } else {
          acc[key] = {
            month: crr.date,
            expend: Number(crr.price) + Number(acc[key].expend),
          };
        }
        return acc;
      }, {});

      for (let list in monthTotal) {
        this.yearsExpend.push(monthTotal[list]);
      }

      eventBus.$emit('monthExpend', this.yearsExpend);
    },
  },
};
</script>

<style></style>
