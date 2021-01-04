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
            type="password"
            v-model="password"
            autocomplete="off"
          />
          <!-- 비밀번호 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="password && !passwordCheck">비밀번호를 입력해주세요.</p>
          </div>
        </div>
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

          if (window.innerWidth > 1023) {
            initRegistForm();
          }

          this.settingListRef(uid)
            .get()
            .then(snapshot => {
              // 셋팅리스트에 값이 비어있으면
              if (snapshot.empty) {
                this.alertMessage =
                  '첫 로그인 성공 ! 관리페이지에서 목표금액과 자산을 설정해주세요.';

                this.loginSuccess('setting', this.alertMessage);

                // 셋팅리스트에 값이 있으면
              } else {
                if (snapshot.docs.length < 3) {
                  this.alertMessage =
                    '로그인 성공 ! 관리페이지에서 값을 채워주세요.';

                  this.loginSuccess('setting', this.alertMessage);

                  //값이 다 있으면 '메인페이지로 이동'
                } else {
                  this.alertMessage = '로그인 성공 ! 메인페이지로 이동합니다.';
                  this.loginSuccess('main', this.alertMessage);
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
        // 에러메세지
        this.errorMessage(err);
      }
    },
    // 로그인 성공한뒤 로직
    loginSuccess(position, msg) {
      // 위치가 setting
      if (position == 'setting') {
        bus.$emit('show:toast', msg, 'check');

        setTimeout(() => {
          this.$router.push(`/${position}`);
        }, 2500);

        // 위치가 main
      } else {
        bus.$emit('show:toast', msg, 'check');

        setTimeout(() => {
          this.$router.push(`/${position}`);
        }, 2500);
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
    // settings DB
    settingListRef(uid) {
      return settingColRef(uid);
    },
  },
};
</script>
