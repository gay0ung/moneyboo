<template>
  <div class="set-asset">
    <!-- 페이지 로딩 시 은행 별 자산 남은 금액 구하기 위한 함수 실행 -->
    {{ matchBankPrice() }}
    <!-- 1.목표금액 설정 2.각 자산들 설정 -->
    <h3 class="font-jua">목표 금액 설정</h3>
    <b class="explanation">* 모든 금액은 숫자만 기입해 주세요</b>
    <form action="" class="clear">
      <div action="" class="total-goal-cont">
        <strong>총 목표 금액</strong>
        <input
          type="text"
          placeholder="총 목표 금액을 입력해 주세요"
          v-model="saveAsset.assets.totalGoal"
        />
      </div>

      <div action="" class="money-goal-cont">
        <strong>현금 목표 금액</strong>
        <input
          type="text"
          placeholder="현금 목표 금액을 입력해 주세요"
          v-model="saveAsset.assets.cashGoal"
        />
      </div>

      <div action="" class="money-asset-cont">
        <strong>현금 자산</strong>
        <input
          type="text"
          placeholder="현금 자산을 입력해 주세요"
          v-model="saveAsset.assets.cashAsset"
        />
      </div>

      <div action="" class="credit-goal-cont">
        <strong>은행 별 자산 입력</strong>
        <b class="explanation" v-if="bankLength !== 0">
          <!-- 저장되어 있는 은행 개수를 불러와야 하기 때문에 firebase에 저장되어있는 banks의 length를 이용. -->
          ( 현재 {{ bankLength }}개의 은행 자산이 저장되어 있습니다.)
        </b>
        <button @click.prevent="clickAddBank()">+</button>
        <ul>
          <li class="explanationLi" v-if="saveAsset.banks.length === 0">
            <!-- 입력창이 하나라도 생성되면 안내글을 사라지게 해야하므로, saveAsset의 banks 길이를 이용 -->
            <span class="explanation">
              우측 <span>+</span> 버튼을 눌러 은행 별 자산 입력창을 추가해
              주세요.
            </span>
          </li>
          <li v-for="(bankList, index) in saveAsset.banks" :key="bankList.id">
            <span class="savedBankName">{{ saveAsset.banks[index].bank }}</span>
            <select name="bank" v-model="bankList.bank">
              <option value="">은행선택</option>
              <option
                v-for="bankName in notSavedBankNameList"
                :key="bankName"
                :value="bankName"
              >
                {{ bankName }}
              </option>
            </select>
            <input
              type="text"
              placeholder="해당 은행의 총 자산을 입력해 주세요"
              v-model="bankList.asset"
              v-if="
                bankLength === index ||
                  (bankAssetClick.index === index &&
                    bankAssetClick.click === true) ||
                  newBank === true
              "
            />
            <span
              class="realTimeAsset"
              :class="{
                show: bankLength !== index && bankAssetClick.index !== index,
              }"
              v-if="
                bankLength !== index &&
                  bankAssetClick.index !== index &&
                  newBank === false
              "
            >
              <span> {{ bankBalance[index] }}원 </span>
            </span>
            <button
              class="edit"
              :class="{
                hide: bankAssetClick.index === index,
              }"
              v-if="
                saveAsset.banks[index].asset !== '' &&
                  bankLength !== index &&
                  newBank === false
              "
              @click.prevent="editBankAsset(index)"
            >
              수정
            </button>
            <button
              class="btn small remove"
              @click.prevent="clickRemoveBank(bankList)"
            >
              ✕
            </button>
          </li>
        </ul>
      </div>
      <button
        class="btn small"
        v-if="
          this.$store.state.total === '' &&
            this.$store.state.cash === '' &&
            this.$store.state.bankAsset.bank === '' &&
            this.$store.state.bankAsset.asset === 0
        "
        @click.prevent="clickSaveAsset()"
      >
        설정
      </button>
      <button
        class="btn small"
        v-if="
          this.$store.state.total !== '' ||
            this.$store.state.cash !== '' ||
            this.$store.state.bankAsset.bank !== '' ||
            this.$store.state.bankAsset.asset !== 0
        "
        @click.prevent="clickSaveAsset()"
      >
        수정
      </button>
    </form>
  </div>
</template>

<script>
import { makeID, addComma /*newConversionMonth*/ } from '@/utils/filters.js';
import { moneybooRef, settingColRef } from '@/api/firestore';
import firebase from 'firebase';
import bus from '@/utils/bus';
export default {
  data() {
    return {
      // 은행사 목록
      bankNameList: [
        '경남은행',
        '광주은행',
        '국민은행',
        '기업은행',
        '농협',
        '대구은행',
        '부산은행',
        '산업은행',
        '저축은행',
        '새마을금고',
        '수협중앙회',
        '신협',
        '신한은행',
        '우리은행',
        '우체국',
        '전북은행',
        '제주은행',
        '카카오뱅크',
        '케이뱅크',
        '하나은행',
        '한국씨티은행',
        'SC제일은행',
      ],
      // 저장된 은행 제외한 은행 목록
      notSavedBankNameList: [],
      // '입력한 값', 'firebase에서 불러온 저장된 값' 모두 saveAsset 이용.
      saveAsset: {
        assets: {
          totalGoal: '',
          cashGoal: '',
          cashAsset: '',
        },
        banks: [],
      },
      bankLength: 0, // 저장된 은행 개수 위해 필요.
      expenditure: [],
      currentUid: this.$store.state.uid, // 현재 로그인한 유저의 uid
      // 은행 별 지출 금액 데이터 불러옴(from DailyList) - 모든 달(month)의 내역 불러옴.
      getAllListData: [], // (현재 얼마남았는지 나타내는 tag에서 사용.)
      // 은행 별 잔고(화면 출력용)
      bankBalance: [],
      // 은행 별 자산 [수정]버튼 클릭 판단 값.
      bankAssetClick: {
        index: '',
        click: false,
      },
      newBank: false,
      savedBankList: [],
    };
  },
  created() {
    // 페이지 로딩 시 기본적으로 은행 별 자산 입력 칸 하나 생성시켜줌.
    // if (this.saveAsset.banks === []) {
    //   this.saveAsset.banks.push({ bank: '', asset: '', id: '' });
    // }
    // firstore에서 asset DB 가져오기
    this.getFirebase();
    // DailyList.vue의 지출 내역 불러옴.
    this.getBankBalance();
  },
  computed: {},
  methods: {
    mbooRef() {
      return moneybooRef(this.currentUid);
    },
    settingListRef() {
      // settings document > settingList collection 참조값
      return settingColRef(this.currentUid);
    },
    // listAdd collection 참조 값
    dailyListAddRef() {
      return this.mbooRef()
        .doc('daily')
        .collection('listAdd');
    },
    // 숫자만 입력되었는지 확인.
    checkNum(inputData) {
      // 콤마 있으면 지워줌.
      inputData = this.removeComma(inputData);
      let title = '';
      if (inputData === this.saveAsset.assets.totalGoal) {
        title = '총 목표 금액';
      } else if (inputData === this.saveAsset.assets.cashAsset) {
        title = '현금 자산';
      } else if (inputData === this.saveAsset.assets.cashAsset) {
        title = '현금 자산';
      } else if (inputData === this.saveAsset.assets.cashGoal) {
        title = '현금 목표 금액';
      }
      for (let i = 0; i < this.saveAsset.banks.length; i++) {
        if (inputData === this.saveAsset.banks[i].asset) {
          title = '은행 별 자산';
        }
      }
      if (isNaN(inputData)) {
        let alertData = {
          show: true,
          message: `'${title}'에 숫자만 입력해주세요.`,
        };
        bus.$emit('sendAlertMessage', alertData);
        return 'notNum';
      }
    },
    clickAddBank() {
      this.saveAsset.banks.push({ bank: '', asset: '', id: makeID('bank') });
      this.newBank = true;
    },
    clickRemoveBank(bankList) {
      // 삭제 전 은행 별 자산 금액에 콤마를 제거해 줌.(firebase에 저장된 은행자산 데이터와 형식 맞추기 위함.)
      bankList.asset = this.removeComma(bankList.asset);
      // 클릭한 은행 별 자산 삭제.
      this.settingListRef()
        .doc('banks')
        .update({ banks: firebase.firestore.FieldValue.arrayRemove(bankList) });
    },
    clickSaveAsset() {
      // asset, bankasset이 모두 완벽하게 입력 되었는지 확인하기 위한 변수 선언.
      let assetSaveErrorCheck = false;
      let bankSaveErrorCheck = false;
      // (asset, bank 저장 시 input에 제대로 입력했을 때에만 true가 반환되도록 해줌.)
      // 에셋리스트 저장
      assetSaveErrorCheck = this.saveAssetListForm();
      // bank 저장
      bankSaveErrorCheck = this.setBankListForm();
      // asset, bank 모두 true값을 반환할 때만 alert창이 뜨도록 함.
      if (assetSaveErrorCheck === true && bankSaveErrorCheck === true) {
        // 저장되었다는 안내창 뜨게 한 후 새로고침.
        let alertData = {
          show: true,
          message: '목표 금액이 수정되었습니다.',
        };
        bus.$emit('sendAlertMessage', alertData);
        // location.reload();
      }
      this.bankAssetClick = false;
    },
    // created()에서 사용할 함수(추가, 수정, 삭제 된 데이터 화면에 바로 반영되도록.)
    getFirebase() {
      // assets
      this.settingListRef()
        .doc('assets')
        .onSnapshot(snapshot => {
          // console.log(snapshot.data().setAsset);
          // document의 값이 있으면
          if (snapshot.exists) {
            const assets = snapshot.data().assets;
            if (assets) {
              this.saveAsset.assets.totalGoal = this.assetAddComma(
                // 저장 후 화면에 금액 나타날 때 1000단위 콤마 적용.
                assets.totalGoal,
              );
              this.saveAsset.assets.cashAsset = this.assetAddComma(
                // 저장 후 화면에 금액 나타날 때 1000단위 콤마 적용.
                assets.cashAsset,
              );
              this.saveAsset.assets.cashGoal = this.assetAddComma(
                // 저장 후 화면에 금액 나타날 때 1000단위 콤마 적용.
                assets.cashGoal,
              );
            }
          }
        });
      // banks
      // this.saveAsset.banks.push({ bank: '', asset: '', id: makeID('bank') });
      this.settingListRef()
        .doc('banks')
        .onSnapshot(snapshot => {
          // console.log(snapshot.data().setAsset);
          // document의 값이 있으면
          if (snapshot.exists) {
            const banks = snapshot.data().banks;
            if (banks) {
              this.saveAsset.banks = banks;
              this.bankLength = banks.length;
              for (let i = 0; i < banks.length; i++) {
                // 저장된 은행명 체크 후 savedBankList에 추가함.
                this.savedBankList.push(banks[i].bank);
                // 저장 후 화면에 금액 나타날 때 1000단위 콤마 적용.
                this.saveAsset.banks[i].asset = this.assetAddComma(
                  banks[i].asset,
                );
              }
            }
          }

          // firebase에 저장되지 않은 은행만 notSavedBankNameList에 추가.(추가시 중복되지 않도록)
          console.log(this.bankNameList);
          console.log(this.savedBankList);
          this.bankNameList.forEach(name => {
            for (let i = 0; i < this.savedBankList.length; i++) {
              if (name === this.savedBankList[i]) {
                this.bankNameList.splice(this.bankNameList.indexOf(name), 1);
              }
            }
          });
          console.log(this.bankNameList);
          this.notSavedBankNameList = this.bankNameList;
          console.log(this.notSavedBankNameList);
        });
    },
    // asset 저장
    saveAssetListForm() {
      // 저장하려는 값에 적힌 콤마 제거.
      this.saveAsset.assets.totalGoal = this.removeComma(
        this.saveAsset.assets.totalGoal,
      );
      this.saveAsset.assets.cashAsset = this.removeComma(
        this.saveAsset.assets.cashAsset,
      );
      this.saveAsset.assets.cashGoal = this.removeComma(
        this.saveAsset.assets.cashGoal,
      );
      // 숫자만 입력했는지 확인.
      if (this.checkNum(this.saveAsset.assets.totalGoal) === 'notNum') return;
      if (this.checkNum(this.saveAsset.assets.cashAsset) === 'notNum') return;
      if (this.checkNum(this.saveAsset.assets.cashGoal) === 'notNum') return;
      // 총 목표금액이 공백일 경우 알림창 뜨게 함.
      if (this.saveAsset.assets.totalGoal === '') {
        let alertData = {
          show: true,
          message: "'총 목표 금액'을 입력해 주세요.",
        };
        bus.$emit('sendAlertMessage', alertData);
        return;
      }
      // '현금 목표금액', '현금 자산'을 입력하지 않았을 경우 '0'원으로 저장 함.
      if (this.saveAsset.assets.cashAsset === '') {
        this.saveAsset.assets.cashAsset = 0;
      }
      if (this.saveAsset.assets.cashGoal === '') {
        this.saveAsset.assets.cashGoal = 0;
      }
      console.log(this.saveAsset.assets);
      // 숫자만 입력되었으면 입력값 저장.
      this.settingListRef()
        .doc('assets')
        .get()
        .then(doc => {
          console.log(doc);
          // asset doc이 있다면?
          if (doc.exists) {
            this.settingListRef()
              .doc('assets')
              .update({ assets: this.saveAsset.assets });
            // asset doc이 없다면?
          } else {
            this.settingListRef()
              .doc('assets')
              .set({
                assets: this.saveAsset.assets,
              });
          }
        })
        .catch(err => {
          console.log('여기는 setAsset.vue에서 saveAssetListForm', err);
        });
      // asset의 input칸들이 제대로 입력되었을 경우 true반환.
      return true;
    },
    // bank 저장
    setBankListForm() {
      for (let i = 0; i < this.saveAsset.banks.length; i++) {
        // 저장하려는 값에 적힌 콤마 제거.
        this.saveAsset.banks[i].asset = this.removeComma(
          this.saveAsset.banks[i].asset,
        );
        // 은행이 선택되었는지 확인.
        if (this.saveAsset.banks[i].bank === '') {
          let alertData = {
            show: true,
            message: "'은행'을 선택해 주세요.",
          };
          bus.$emit('sendAlertMessage', alertData);
          return;
        }
        // 은행 별 자산에 숫자만 입력되었는지 확인.
        if (this.checkNum(this.saveAsset.banks[i].asset) === 'notNum') return;
        // 각 은행별 자산이 공백일 경우 알림창 뜨게 함.
        if (this.saveAsset.banks[i].asset === '') {
          let alertData = {
            show: true,
            message: "'은행 별 자산 금액'을 입력해 주세요.",
          };
          bus.$emit('sendAlertMessage', alertData);
          return;
        }
      }
      this.settingListRef()
        .doc('banks')
        .get()
        .then(doc => {
          // banks doc이 있다면
          if (doc.exists) {
            this.settingListRef()
              .doc('banks')
              .update({
                banks: this.saveAsset.banks,
              });
            // banks doc이 없다면
          } else {
            this.settingListRef()
              .doc('banks')
              .set({
                banks: this.saveAsset.banks,
              });
          }
        })
        .catch(err => {
          console.log('SetAsset.vue 에 있는 setBankListForm', err);
        });

      // // savedBankList에 추가된 은행 이름 넣기.
      // for (let i = 0; i < this.saveAsset.banks.length; i++) {
      //   this.saveAsset.banks[i].bank;
      //   console.log(this.saveAsset.banks[i].bank);
      //   this.savedBankList.push(this.saveAsset.banks[i].bank);
      //   console.log(this.savedBankList);
      // }

      // 수정 끝나면 은행별 자산 비활성박스 덮어씌워진 css 제거.
      this.editCssReset();
      // 수정 끝나면 this.newBank = false로 체인지.(새로운 은행별 자산 입력칸 생성 시 input창 보이도록 했던 기능 끔.)
      this.newBank = false;
      // bank의 input칸들이 제대로 입력되었을 경우 true반환.
      return true;
    },
    // DailyList.vue의 지출 내역 불러옴.
    getBankBalance() {
      // listAdd collection 하위에 있는 document 전체를 불러옴
      this.dailyListAddRef()
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            // 월별 지출내역 배열 겟.
            const monthListData = doc.data().listData;
            monthListData.forEach(ele => {
              // 월별 지출내역을 월로 나누지 않고 배열로 생성.
              this.getAllListData.push(ele);
            });
          });
        })
        .catch(err => {
          console.log('daily의 지출 내역을 불러올 수 없음.', err);
        });
    },
    // 각 은행 별 자산 사용 후 남은 금액.
    matchBankPrice() {
      console.log('은행 남은 자산액 구하는 함수 돈다!!!');
      let bankArr = [];
      for (let i = 0; i < this.saveAsset.banks.length; i++) {
        let bankArrCont = {
          bank: this.saveAsset.banks[i].bank,
          asset: this.removeComma(this.saveAsset.banks[i].asset) * 1,
        };
        bankArr[i] = bankArrCont;
      }
      console.log(bankArr);
      // 'dailyList'에서 불러온 지출/수입 내역 foreEach로 확인.
      this.getAllListData.forEach(listdata => {
        // bankAsset과 같은 은행의 지출 내역 구함.
        for (let i = 0; i < this.saveAsset.banks.length; i++) {
          if (listdata.bank === bankArr[i].bank && listdata.item === 'expend') {
            bankArr[i].asset += -listdata.price * 1;
          } else if (
            // bankAsset과 같은 은행의 수입 내역 구함.
            listdata.bank === bankArr[i].bank &&
            listdata.item === 'income'
          ) {
            bankArr[i].asset += listdata.price * 1;
          }
        }
      });
      for (let i = 0; i < bankArr.length; i++) {
        // bankAsset에서 해당은행사 지출내역 뺴줌.(1000단위로 콤마 찍어줌)
        this.bankBalance[i] = this.assetAddComma(bankArr[i].asset * 1);
      }
    },
    // 은행 별 자산 [수정]버튼 클릭 시 input창에 남은 금액 뜨게 함.
    editBankAsset(index) {
      for (let i = 0; i < this.saveAsset.banks.length; i++) {
        this.saveAsset.banks[index].asset = this.bankBalance[index];
      }
      this.bankAssetClick = {
        index: index,
        click: true,
      };
      this.editCssChange();
    },
    editCssChange() {
      const target = event.target.parentNode.children[0].value;
      const lis = event.target.parentNode.parentNode.children;
      lis.forEach(li => {
        const liBank = li.children[0].value;
        if (target !== liBank) {
          li.classList.add('disabled');
        }
      });
      const editBtn = document.querySelector('.set-asset > form > .btn');
      editBtn.classList.add('colorChange');
    },
    editCssReset() {
      const lis = document.querySelectorAll('.set-asset ul > li');
      const editBtn = document.querySelector('.set-asset > form > .btn');
      console.log(lis);
      lis.forEach(li => {
        li.classList.remove('disabled');
      });
      editBtn.classList.remove('colorChange');
    },
    assetAddComma(asset) {
      return addComma(asset);
    },
    removeComma(asset) {
      return asset.replace(/,/g, '');
    },
  },
};
</script>

<style></style>
