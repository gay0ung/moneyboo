<template>
  <!--회원가입 페이지  -->
  <div class="regist-form signup-form">
    <div class="regist-form-cont">
      <h3>회원가입</h3>
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
            <p v-if="useremail && !emailValidCheck">
              이메일 형식으로 입력해주세요.
            </p>
          </div>
        </div>
        <!-- 닉네임 -->
        <div :class="{ active: nickname }">
          <label for="nickname" v-if="!nickname">닉네임</label>
          <input
            id="nickname"
            type="text"
            v-model="nickname"
            autocomplete="off"
          />
          <!-- 닉네임 유효성 검사 메세지 -->
          <div class="logmessage-box">
            <p v-if="nickname && !nicknameValidCheck">
              2 ~ 9자로 입력해주세요.
            </p>
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
            <p v-if="password && !passwordValidCheck">
              숫자 6자이상 입력해주세요.
            </p>
          </div>
        </div>
        <!-- 회원가입 버튼 -->
        <button
          :class="{ active: joinActiveBtn }"
          class="btn big signup add-btn font-jua"
          :disabled="!userCompleted"
        >
          가입
        </button>
      </form>
      <button class="reset-btn" @click.prevent="resetBtnForm()">
        되돌아가기
      </button>
      <button class="go-btn login font-jua" @click.prevent="goLoginBtn()">
        <i class="fas fa-arrow-left"></i>로그인
      </button>
    </div>
    <!-- 첫 화면 마스크 -->
    <a
      href=""
      class="mask mask-signup fade"
      @click.prevent="clickSignupForm($event)"
      @mouseover="overSignupForm($event)"
      @mouseout="outSignupForm($event)"
    >
      <i class="mask-icon mask-signup"></i>
      <strong class="font-jua mask-signup">회원가입</strong>
    </a>
  </div>
</template>
<script>
import { signupUser, userProfileUpdate } from '@/api/fireAuth';
import { moneybooRef } from '@/api/firestore';
import { dateFormat } from '@/utils/filters';
import {
  passwordValidation,
  emailValidation,
  nicknameValidation,
} from '@/utils/validation';
import {
  clickFormEvent,
  globalMountedInSingup,
  overFormEvent,
  resetFormEvent,
  outFormEvent,
  initRegistForm,
  goLoginEvent,
  // init,
} from '@/js/registration.js';
import bus from '@/utils/bus';

export default {
  data() {
    return {
      // user info
      useremail: '',
      nickname: '',
      password: '',
      // log message
      validlogMessage: '',
    };
  },
  computed: {
    userCompleted() {
      return this.useremail && this.nickname && this.password;
    },
    emailValidCheck() {
      return emailValidation(this.useremail);
    },
    passwordValidCheck() {
      return passwordValidation(this.password);
    },
    joinActiveBtn() {
      return (
        this.userCompleted && this.emailValidCheck && this.passwordValidCheck
      );
    },
    nicknameValidCheck() {
      return nicknameValidation(this.nickname);
    },
  },
  created() {},
  mounted() {
    // 이벤트 함수를 담당하는 js 함수에 element를 넘겨줘서 쉽게 dom을 제어할 수 있도록 함.
    globalMountedInSingup(this.$el);
    // init();
  },
  methods: {
    // 회원가입 양식 제출
    async submitForm() {
      // this.validlogMessage = '';
      try {
        // 유저정보가 입력되고 입력 형식이 맞는다면
        if (
          this.userCompleted &&
          this.emailValidCheck &&
          this.passwordValidCheck &&
          this.nicknameValidCheck
        ) {
          const response = await signupUser(this.useremail, this.password);

          // 닉네임 등록
          userProfileUpdate(response, this.nickname);

          const userInfo = {
            createdAt: this.getDateFormat(new Date()),
            email: response.user.email,
            nickname: this.nickname,
          };

          // user 정보 DB에 등록
          this.userInfoSetting(response.user.uid, userInfo);

          console.log(response);
          this.resetUserInfo();
          if (window.innerWidth > 1023) {
            initRegistForm();
          } else {
            goLoginEvent();
          }
          // initRegistForm();
          bus.$emit(
            'show:toast',
            '계정이 생성되었습니다! 로그인을 해주세요 🎉',
            'check',
          );

          // 입력값이 없고 유효성이 맞지않는다면
        } else {
          // 유효성 검사 메세지 호출
          this.validCheckMessage(
            this.emailValidCheck,
            this.passwordValidCheck,
            this.nicknameValidCheck,
          );
        }

        // 에러처리
      } catch (err) {
        console.log(err);
        this.errorMessage(err);
      }

      //this.resetUserInfo(); // input 값 리셋
    },
    // 회원가입 페이지 클릭 이벤트
    clickSignupForm(event) {
      clickFormEvent(event.target);
    },
    // 마우스오버 이벤트
    overSignupForm(event) {
      overFormEvent(event.target);
    },
    // 리셋 버튼
    resetBtnForm() {
      resetFormEvent('signup');
      // this.resetUserInfo();
    },
    // 마우스 아웃 이벤트
    outSignupForm(event) {
      outFormEvent(event);
    },
    // input 정보 리셋 함수
    resetUserInfo() {
      this.nickname = '';
      this.useremail = '';
      this.password = '';
      this.validlogMessage = '';
    },
    // 로그인 페이지로 이동
    goLoginBtn() {
      goLoginEvent();
      this.resetUserInfo();
    },
    // 날짜 포맷
    getDateFormat(date) {
      return dateFormat(date);
    },
    // 이메일 유효성 검사 경고 메세지
    validCheckMessage(email, password, nickname) {
      this.validlogMessage =
        !email && !password
          ? '이메일과 비밀번호 형식이 맞지 않습니다.'
          : !email
          ? '이메일 형식이 맞지 않습니다.'
          : !nickname
          ? '닉네임은 2자이상 9자 이하로 작성해주세요.'
          : '비밀번호 형식이 맞지 않습니다.';

      bus.$emit('show:toast', this.validlogMessage, 'warning');
    },
    // 에러 메세지
    errorMessage(err) {
      this.validlogMessage =
        err.code === 'auth/email-already-in-use'
          ? '이미 사용 중인 이메일입니다. 다시 한번 확인해 주세요.'
          : '';
      bus.$emit('show:toast', this.validlogMessage, 'warning');
    },
    userInfoSetting(uid, userData) {
      return moneybooRef(uid)
        .doc('userInfo')
        .set(userData);
    },
  },
};
</script>
