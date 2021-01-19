<template>
  <div class="statistics-list">
    <template v-if="selectedChart === ''">
      <ul ref="ul">
        <li v-for="(value, idx) in cList" :key="value.id" :id="idx">
          <b
            ><i :style="{ backgroundColor: bgColors[idx] }"></i
            >{{ value.category }}</b
          >
          <span>{{ getComma(value.price) }} 원</span>
        </li>
      </ul>
    </template>
    <template v-if-else="selectedChart !== ''">
      <ul ref="ul">
        <li
          v-for="(value, idx) in cDetail[selectedChart]"
          :key="value.id"
          :id="idx"
        >
          <b
            ><i :style="{ backgroundColor: hbgColors[selectedNum] }"></i
            >{{ value.text }}</b
          >
          <span>{{ getComma(value.price) }} 원</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { addComma, newConversionMonth } from '@/utils/filters';
import { dailyColRef } from '@/api/firestore';
import { eventBus } from '../../main';
import { mapState } from 'vuex';

export default {
  props: ['selectedChart', 'selectedNum', 'roundData', 'bgColors', 'hbgColors'],
  data() {
    return {
      dailyList: [],
      cList: [], // 카테고리별 분류
      cDetail: [], // 카테고리별 상세내용
    };
  },
  created() {
    this.getDailyList();
  },
  computed: {
    ...mapState(['uid']),
    getComma() {
      return addComma;
    },
    newConversionMonth() {
      return newConversionMonth;
    },
  },
  methods: {
    dailyColRef() {
      return dailyColRef(this.uid);
    },

    // daily > dailList > listAdd
    getDailyList() {
      const today = newConversionMonth();
      this.dailyColRef()
        .doc(today)
        .onSnapshot(snapShot => {
          if (snapShot.exists) {
            let dailyList = snapShot.data().listData;
            this.categoryTotal(dailyList);
          } else {
            alert('데일리에서 값을 추가해 주세요.');
          }
        });
    },

    // 카테고리별로 배열 담기
    categoryTotal(listData) {
      let mExpend = [];

      // 지출내역만 추출
      mExpend = listData.filter(expend => expend.item === 'expend');

      this.sameCategory(mExpend, 'category');

      this.calculate(mExpend);
      this.sortCategory(this.cList);
      eventBus.$emit('category-list', this.cList);
    },

    // 같은 카테고리 상세내용 정리한 함수
    sameCategory(ctArr, value) {
      return ctArr.reduce((acc, obj) => {
        let key = obj[value];

        let scObj = {
          text: obj.text,
          price: Number(obj.price),
        };

        if (!acc[key]) {
          acc[key] = [scObj];
        } else {
          acc[key].push(scObj);
        }

        return (this.cDetail = acc);
      }, {});
    },

    // 카테고리별 총 지출을 알고 싶을때
    calculate(cList) {
      return cList.reduce((acc, obj) => {
        let key = obj.category;
        if (!acc[key]) {
          acc[key] = {
            category: obj.category,
            price: Number(obj.price),
          };
        } else {
          acc[key] = {
            category: obj.category,
            price: Number(acc[key].price) + Number(obj.price),
          };
        }

        return (this.cList = acc);
      }, {});
    },

    // 카테고리 원하는 순서로 저장하기
    sortCategory(obj) {
      let sortObj = [];
      for (let value in obj) {
        sortObj.push(obj[value]);
      }

      sortObj.sort((a, b) => {
        return a.price > b.price ? -1 : a.price < b.price ? 1 : 0;
      });
      this.cList = sortObj;
    },
  },
};
</script>

<style></style>
