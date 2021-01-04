<template>
  <!-- 로그인 페이지 -->
  <div class="regist-form login-form">
    <div class="regist-form-cont">
      <h3>로그인</h3>
      <!-- autocomplete="off" -->
      <form class="form" action="" @submit.prevent="submitForm">
        <!-- 아이디 -->
        <div :class="{ active: useremail }">
          <label for="useremail" v-if="!useremail">이메일</label>
          <input
            id="useremail"
            type="text"
            v-model="useremail"
            autocomplete="off"
          />
          <!-- 이메일 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="useremail && !emailCheck">가입된 이메일을 입력해주세요.</p>
          </div>
        </div>
        <!-- 비밀번호 -->
        <div :class="{ active: password }">
          <label for="password" v-if="!password">비밀번호</label>
          <input
            id="password"
            type="text"
            v-model="password"
            autocomplete="off"
          />
          <!-- 비밀번호 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="password && !passwordCheck">비밀번호를 입력해주세요.</p>
          </div>
        </div>
        <!-- 회원정보 까먹었을때 찾는 버튼 -->
        <!-- <p><a href="" class="font-jua">비밀번호 찾기</a></p> -->
        <button
          :class="{ active: loginSuccessBtn }"
          class="btn big login add-btn font-jua"
          :disabled="!userCompleted"
        >
          로그인
        </button>
      </form>
      <button class="reset-btn" @click.prevent="resetBtnForm()">
        되돌아가기
      </button>
      <button class="go-btn signup font-jua" @click.prevent="goSignupBtn()">
        회원가입 <i class="fas fa-arrow-right"></i>
      </button>
    </div>
    <!-- 첫 화면 마스크 -->
    <a
      href=""
      class="mask mask-login fade"
      @mouseover="overLoginForm($event)"
      @click.prevent="clickSignupForm($event)"
      @mouseout="outLoginForm()"
    >
      <i class="mask-icon mask-login"></i>
      <strong class="font-jua mask-login">로그인</strong>
    </a>
  </div>
</template>
<script>
import {
  clickFormEvent,
  globalMountedInLogin,
  overFormEvent,
  resetFormEvent,
  outFormEvent,
  initRegistForm,
  goSignupEvent,
} from '@/js/registration.js';
import { passwordValidation, emailValidation } from '@/utils/validation';
import { settingColRef } from '@/api/firestore';
import bus from '@/utils/bus';

export default {
  data() {
    return {
      // register
      useremail: '',
      password: '',
      // log message
      errMessage: '',
      alertMessage: '',
    };
  },
  created() {},
  mounted() {
    // 이벤트 함수를 담당하는 js 함수에 element를 넘겨줘서 쉽게 dom을 제어할 수 있도록 함.
    globalMountedInLogin(this.$el);
    // init(this.$el);
  },
  computed: {
    // user가 입력됐는지 확인
    userCompleted() {
      return this.useremail && this.password;
    },
    // 이메일 유효성 검사
    emailCheck() {
      return emailValidation(this.useremail);
    },
    // 비밀번호 유효성 검사
    passwordCheck() {
      return passwordValidation(this.password);
    },
    // 조건이 성립하면 버튼 제출하도록 체크
    loginSuccessBtn() {
      return this.userCompleted && this.emailCheck && this.passwordCheck;
    },
  },
  methods: {
    // 로그인 양식 제출
    async submitForm() {
      this.errMessage = '';

      const userData = {
        email: this.useremail,
        password: this.password,
      };

      try {
        // 입력값, 유효성검사가 완료되면
        if (this.userCompleted && this.emailCheck && this.passwordCheck) {
          const response = await this.$store.dispatch('FATCH_LOGIN', userData);
          const uid = response.user.uid;

          // console.log(response);
          // this.initForm();
          if (window.innerWidth > 1023) {
            initRegistForm();
          }
          // settings에 데이터 확인하고 라우터 이동
          // this.settingsRef(response.user.uid)
          //   .get()
          //   .then(doc => {
          //     // settings에 값이 있으면?
          //     console.log(doc);
          //     if (doc.exists) {
          //       this.loginSuccess('main');
          //     } else {
          //       this.loginSuccess('setting');
          //     }
          //   });

          this.settingListRef(uid)
            .get()
            .then(snapshot => {
              console.log('셋팅리스트', snapshot);
              // snapshot.empty === false 면 col에 값이 있는 것

              // 셋팅리스트에 값이 비어있으면
              if (snapshot.empty) {
                console.log(snapshot.empty, '비어있다!!');
                this.alertMessage =
                  '첫 로그인 성공 ! 관리페이지에서 목표금액과 자산을 설정해주세요.';

                bus.$emit('show:toast', this.alertMessage, 'check');

                setTimeout(() => {
                  this.$router.push(`/setting`).catch(err => {
                    console.log('로그인폼 셋팅즈로 이동하는01', err);
                  });
                }, 2500);

                // 셋팅리스트에 값이 있으면
              } else {
                console.log(snapshot.empty, '값이있다!!!');

                // snapshot.docs.forEach(data => {
                //   console.log('이건데이터의데이터', data.data());

                //   console.log('에셋 ===>', data.data().assets.length);
                //   console.log('뱅크 ===>', data.data().banks.length);
                //   console.log('카테고리 ===>', data.data().categories.length);
                // });

                if (snapshot.docs.length < 3) {
                  console.log('3보다 작음');

                  this.alertMessage =
                    '로그인 성공 ! 관리페이지에서 값을 채워주세요.';

                  bus.$emit('show:toast', this.alertMessage, 'check');

                  setTimeout(() => {
                    this.$router.push(`/setting`).catch(err => {
                      console.log('로그인폼 셋팅즈로 이동하는02', err);
                    });
                  }, 2500);

                  //값이 다 있으면 '메인페이지로 이동'
                } else {
                  console.log('3보다 큼');

                  this.alertMessage = '로그인 성공 ! 메인페이지로 이동합니다.';

                  bus.$emit('show:toast', this.alertMessage, 'check');

                  setTimeout(() => {
                    this.$router.push('/main').catch(err => {
                      console.log('로그인폼 메인으로 이동하는', err);
                    });
                  }, 2500);
                }
              }
            });

          bus.$emit('start:spinner');

          this.alertMessage = '';

          // 유효성 검사가 맞지않으면
        } else {
          // 에러메세지
          this.validCheckMessage(this.emailCheck, this.passwordCheck);
        }
      } catch (err) {
        console.log('로그인폼 에러다!!!', err);
        // 에러메세지
        this.errorMessage(err);
      }
    },
    // 클릭 이벤트
    clickSignupForm(event) {
      console.log(event.target);
      clickFormEvent(event.target);
    },
    // 폼 리셋
    initForm() {
      this.useremail = '';
      this.password = '';
      this.errMessage = '';
    },
    // 마우스오버 이벤트
    overLoginForm(event) {
      overFormEvent(event.target);
    },
    // 리셋 버튼
    resetBtnForm() {
      resetFormEvent('login');
      this.initForm();
    },
    // 마우스 아웃 이벤트
    outLoginForm() {
      outFormEvent();
    },
    // 회원가입 페이지로 이동
    goSignupBtn() {
      goSignupEvent();
      this.initForm();
    },
    // 이메일 유효성 검사 경고 메세지
    validCheckMessage(email, password) {
      this.errMessage =
        !email && !password
          ? '이메일과 비밀번호 형식이 맞지 않습니다.'
          : !email
          ? '이메일 형식이 맞지 않습니다.'
          : '비밀번호 형식이 맞지 않습니다.';
      bus.$emit('show:toast', this.errMessage, 'warning');
    },
    // 에러메세지
    errorMessage(err) {
      this.errMessage =
        err.code === 'auth/user-not-found'
          ? '등록되지 않은 사용자입니다.'
          : err.code === 'auth/wrong-password'
          ? '비밀번호를 확인해주세요.'
          : '';

      bus.$emit('show:toast', this.errMessage, 'warning');
    },
    // 로그인 성공한뒤 로직
    loginSuccess(position) {
      console.log('로그인 성공 ===> 위치는??', position);
      // 첫 로그인 셋팅페이지로 갈때
      if (position === 'setting') {
        console.log('여기는 관리페이지');

        this.alertMessage =
          '첫 로그인 성공 ! 관리페이지에서 목표금액과 자산을 설정해주세요.';
        // 셋팅되어 있을때, main 페이지로 갈때
      } else {
        console.log('여기는 메인페이지');
        this.alertMessage = '로그인 성공 ! 메인페이지로 이동합니다.';
      }
      // 팝업
      bus.$emit('show:toast', this.alertMessage, 'check');

      // 라우터 이동
      setTimeout(() => {
        this.$router.push(`/${position}`);
      }, 2500);
    },
    // settings DB
    settingListRef(uid) {
      return settingColRef(uid);
    },
  },
};
</script>
