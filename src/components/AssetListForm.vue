<template>
  <!-- /main  -->
  <div class="asset-list-form">
    <form>
      <!-- 총자산 -->
      <div class="total-asset-cont">
        <strong>총 자산</strong>
        <b id="ani-money">{{ makeComma(assetTotal) }} 원</b>
      </div>
      <!-- 카드 -->
      <div class="credit-asset-cont">
        <em>카드</em>
        <ul>
          <li v-for="nInfo in bankArr" :key="nInfo.id">
            <span>{{ nInfo.bank }}</span>
            <b id="ani-money">{{ makeComma(nInfo.asset) }}원</b>
          </li>
        </ul>
      </div>
      <!-- 현금 -->
      <div class="cash-asset-cont">
        <em>현금</em>
        <b id="ani-money">{{ makeComma(cash) }} 원</b>
      </div>

      <button @click.prevent="addBtn" class="btn big main">추가</button>
    </form>
  </div>
</template>

<script>
import { addComma } from '@/utils/filters.js';
import { settingColRef, dailyColRef } from '@/api/firestore';
import { mapState } from 'vuex';
import { eventBus } from '../main.js';

export default {
  data() {
    return {
      dailyList: [], // 수입/지출
      assetTotal: '', // 계산된 총 자산
      bankArr: [],
      cash: 0, // 현금자산
    };
  },
  created() {
    this.getDailyList(); // 수입/지출 목록
    this.getAssetsDB(); // 현금 자산
    this.getBanksDB(); // 은행별 자산
  },
  computed: {
    ...mapState(['uid']), // 로그인한 유저 uid
  },
  methods: {
    addBtn() {
      this.$router.push('/daily');
    },

    makeComma(val) {
      return addComma(val);
    },

    // 현금 자산 불러오기
    getAssetsDB() {
      this.settingListRef()
        .doc('assets')
        .onSnapshot(snapshot => {
          if (snapshot.exists) {
            const assets = snapshot.data().assets;
            console.log(snapshot.data());
            this.cash = assets.cashAsset;
          } else if (this.$router.currentRoute.path !== '/main') {
            // 값이 없을 경우
            alert(
              '관리 페이지에서 초기값을 입력해 주세요. 확인을 누르면 해당 페이지로 이동합니다.',
            );
            this.$router.push('/setting');
          } else return;
        });
    },

    // 은행 자산 불러오기
    getBanksDB() {
      this.settingListRef()
        .doc('banks')
        .onSnapshot(snapshot => {
          if (snapshot.exists) {
            this.bankArr = snapshot.data().banks;
            this.totalCalculate();
            this.currenttValues;
          } else {
            // 값이 없을 경우
            alert(
              '관리 페이지에서 은행별 자산 초기값을 입력해 주세요. 확인을 누르면 해당 페이지로 이동합니다.',
            );
            this.$router.push('/setting');
          }
        });
    },

    getDailyList() {
      this.dailyColRef().onSnapshot(snapShot => {
        const listAddLists = snapShot.docs;
        listAddLists.forEach(list => {
          this.dailyList.push(...list.data().listData);
        });
      });
    },

    settingListRef() {
      return settingColRef(this.uid);
    },

//    dailyColRef() {
//      return dailyColRef(this.uid);

    // 은행별 수입 지출 현황
    totalBankAssets(dailyList, bankName, bankAsset) {
      let price = 0;

      dailyList.forEach(listDB => {
        let listBank = listDB.bank;
        let listItem = listDB.item;
        console.log('리스트 디비 체크!!!', listDB);

        if (listBank === bankName && listItem === 'expend') {
          price += Number(listDB.price);
        } else if (listBank === bankName && listItem === 'income') {
          price += -Number(listDB.price);
        }
      });
      console.log('계산====>', this.makeComma(Number(bankAsset) - price));
      return this.makeComma(Number(bankAsset) - price);
    },

    // 총 자산 계산
    totalCalculate() {
      let bankTotal = 0;
      let dailyTotal = 0;
      let cashTotal = 0;

      // 현금 수입/지출 계산
      this.dailyList.map(daily => {
        const dailyItem = daily.item;
        const dailyBank = daily.bank;
        let dailyPrice = Number(daily.price);

        if (dailyBank === '현금' && dailyItem === 'expend') {
          cashTotal += -dailyPrice;
        } else if (dailyBank === '현금' && dailyItem === 'income') {
          cashTotal += dailyPrice;
        }
      });
      this.calulatedBanksAssets();

      this.cash = Number(this.cash) + cashTotal;
      this.bankArr.map(banks => {
        bankTotal += Number(banks.asset);
      });

      // 총자산 계산
      this.assetTotal = bankTotal + this.cash + dailyTotal;
    },

    // 은행별 수입/지출 계산
    bankAssetLists(bank, price, item) {
      const bankArr = this.bankArr;

      bankArr.map(info => {
        const bankInfo = info.bank;

        if (bankInfo === bank && item === 'expend') {
          info.asset -= price;
        } else if (bankInfo === bank && item === 'income') {
          info.asset += price;
        }
      });

      eventBus.$emit('calculatedValues', { cash: this.cash, bankArr: bankArr });
    },

    calulatedBanksAssets() {
      const dailyList = this.dailyList;

      dailyList.map(list => {
        const listBank = list.bank,
          listItem = list.item,
          listPrice = Number(list.price);
        this.bankAssetLists(listBank, listPrice, listItem);
      });
    },
  },
};
</script>

<style></style>
