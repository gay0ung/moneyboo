// 전역변수
//회원가입 변수
let signupForm = null; // width 제어
let signupCont = null; // display : none or block
let signupMask = null;

// true 일때만 mouseout 이벤트가 실행됨.
// click이벤트일때는 false를 줘서 click 했을때 크기가 줄어들지 않도록 도와주는 역할을 한다.
let outCheck = true;
let clickCheck = true; // 클릭이벤트가 실행 중인지 체크해주는 변수

//로그인 변수
let loginForm = null;
let loginCont = null;
let loginMask = null;

let signupBtn = null;
let loginBtn = null;
const setWidth = 50; // 초기 고정 width 값
let timer;

let currentPage = 'login';

// 회원가입 페이지가 마운티드 됐을때 실행
function globalMountedInSingup(elm) {
  // elm = Signup Form
  signupForm = elm;
  signupCont = elm.querySelector('.regist-form-cont');
  signupMask = elm.querySelector('.mask');
  loginBtn = signupCont.querySelector('.go-btn.login');
}

// 로그인 페이지가 마운티드 됐을때 실행
function globalMountedInLogin(elm) {
  //elm = Login Form
  loginForm = elm;
  loginCont = elm.querySelector('.regist-form-cont');
  loginMask = elm.querySelector('.mask');
  signupBtn = loginCont.querySelector('.go-btn.signup');
}

function resizeEvent() {
  window.addEventListener('resize', function() {
    changeClassRemove();

    // 태블릿
    if (window.innerWidth <= 1023) {
      buttonClassAdd();

      // 현재 페이지 로그인
      if (currentPage === 'login') {
        currentPage = 'login';

        loginForm.style.width = '100%';
        loginCont.style.display = 'block';
        loginForm.style.display = 'block';

        loginMask.style.display = 'none';
        signupForm.style.display = 'none';

        transitionReset();

        // 현재페이지 회원가입
      } else if (currentPage === 'signup') {
        currentPage = 'signup';

        loginCont.style.display = 'none';
        loginForm.style.display = 'none';
        loginMask.style.display = 'none';

        signupForm.style.display = 'block';
        signupForm.style.width = '100%';
        signupCont.style.display = 'block';
        signupMask.style.display = 'none';

        transitionReset();
      }

      // pc
    } else if (window.innerWidth > 1023) {
      currentPage = 'login';

      loginCont.style.display = 'block';
      loginForm.style.display = 'block';

      signupMask.style.display = 'block';
      signupForm.style.display = 'block';
      signupCont.style.display = 'block';

      loginForm.style.width = '50%';
      signupForm.style.width = '50%';

      buttonClassRemove();

      initRegistForm();
      clearTimeout(timer);
      timer = setTimeout(() => {
        loginForm.style.transition = '0.7s ease';
        signupForm.style.transition = '0.7s ease';
      }, 100);
    }
  });
}

function transitionReset() {
  loginForm.style.transition = '0s';
  signupForm.style.transition = '0s';
}

function sizeInit() {
  changeClassRemove();
  currentPage = 'login';
  if (window.innerWidth <= 1023) {
    loginForm.style.width = '100%';
    loginCont.style.display = 'block';

    loginMask.style.display = 'none';
    signupForm.style.display = 'none';
    buttonClassAdd();
  } else {
    buttonClassRemove();
  }
}

function goSignupEvent() {
  currentPage = 'signup';
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  signupCont.style.display = 'block';
  signupForm.style.width = '100%';
  signupMask.style.display = 'none';

  changeClassAdd();
}

function goLoginEvent() {
  currentPage = 'login';
  loginForm.style.display = 'block';
  loginForm.style.width = '100%';
  loginCont.style.display = 'block';
  signupForm.style.display = 'none';
  signupCont.style.display = 'none';

  changeClassAdd();
}

function changeClassAdd() {
  loginCont.classList.add('change-left');
  signupCont.classList.add('change-right');
}

function changeClassRemove() {
  loginCont.classList.remove('change-left');
  signupCont.classList.remove('change-right');
}

function buttonClassAdd() {
  signupBtn.classList.add('active');
  loginBtn.classList.add('active');
}

function buttonClassRemove() {
  signupBtn.classList.remove('active');
  loginBtn.classList.remove('active');
}

// 클릭 이벤트
function clickFormEvent(target) {
  outCheck = false; // 클릭 이벤트를 실행했을때 mouseout 이벤트가 실행되지 않도록 false값을 줌
  overWidthChange('click', target, loginForm, signupForm);
}

// 마우스오버 이벤트
function overFormEvent(target) {
  overWidthChange('over', target, loginForm, signupForm);
}

// over시 컨텐츠의 width 크기가 변하는 함수
// 'a' width가 커지면 'b' width가 작아지고 'b' width가 커지면 'a' width가 작아지는 동작
function overWidthChange(kinds, target, login, signup) {
  // kinds
  // 1. kinds = click 이면 width chage = 30 %
  // 2. kinds = over 이면 width chage = 10 %

  const click = { plus: 30, minus: 30 };
  const over = { plus: 8, minus: 8 };
  // const mini = { plus: 27, minus: 27 };

  // 마우스오버이벤트
  if (kinds === 'over' && clickCheck) {
    // clickCheck가 true일 때만 실행해서 클릭 이벤트 실행중일때는 over되는 것을 방지

    // 타겟이 회원가입일 경우
    if (target.classList.contains('mask-signup')) {
      signup.style.width = `${setWidth + over.plus}%`; // 8% 커지고
      login.style.width = `${setWidth - over.minus}%`; // 8% 작아짐

      // 타겟이 로그인일 경우
    } else if (target.classList.contains('mask-login')) {
      signup.style.width = `${setWidth - over.minus}%`;
      login.style.width = `${setWidth + over.plus}%`;
    }
  }

  // 클릭이벤트
  if (kinds === 'click') {
    clickCheck = false; // 클릭됐을때 false로 바꿔줘서 click 상태일때는 반대쪽 컴포넌트에 마우스가 오버되어도 이벤트가 실행되지 않도록 설정

    // 타겟이 회원가입일 경우
    if (target.classList.contains('mask-signup')) {
      signup.style.width = `${setWidth + click.plus}%`;
      login.style.width = `${setWidth - click.minus}%`;

      // css control
      signupMask.style.display = 'none'; // Mask 닫고
      signupCont.style.display = 'block'; // Form 내용물 보여주기

      // 로그인 창 css 변화
      loginForm.classList.add('active');

      // 회원가입창을 클릭했을때 반대로 로그인창은 reset되어야한다.
      loginMask.style.display = 'block';
      loginCont.style.display = 'none';

      signupForm.classList.remove('active');

      //clickCheck = false;
    }

    // 타겟이 로그인일 경우
    if (target.classList.contains('mask-login')) {
      signup.style.width = `${setWidth - click.minus}%`;
      login.style.width = `${setWidth + click.plus}%`;

      // css control
      loginMask.style.display = 'none';
      loginCont.style.display = 'block';

      // 회원가입 창 css 변화
      signupForm.classList.add('active');

      // 로그인창을 클릭했을때 반대로 회원가입창은 reset되어야한다.
      signupMask.style.display = 'block';
      signupCont.style.display = 'none';

      loginForm.classList.remove('active');

      //clickCheck = false;
    }
  }
}

// 리셋 이벤트
function resetFormEvent(target) {
  // 로그인창 리셋 버튼
  if (target === 'login') {
    loginMask.style.display = 'block';
    loginCont.style.display = 'none';

    signupForm.classList.remove('active');
    //회원가입창 리셋 버튼
  } else {
    signupMask.style.display = 'block';
    signupCont.style.display = 'none';

    loginForm.classList.remove('active');
  }

  clickCheck = true; // 클릭 리셋
}

function outFormEvent() {
  if (outCheck && clickCheck) {
    // outCheck & clickCheck 가 true일때만 실행
    loginForm.style.width = `${setWidth}%`;
    signupForm.style.width = `${setWidth}%`;
  }

  outCheck = true; // 마우스가 아웃이되면 true로 변경해줘서 outEvent가 실행되도록 설정해줬다.
}

function initRegistForm() {
  clickCheck = true;
  // 로그인 리셋
  loginMask.style.display = 'block';
  loginCont.style.display = 'none';
  signupForm.classList.remove('active');

  // 회원가입 리셋
  signupMask.style.display = 'block';
  signupCont.style.display = 'none';
  loginForm.classList.remove('active');

  signupForm.style.width = '50%';
  loginForm.style.width = '50%';
}

export {
  clickFormEvent,
  globalMountedInSingup,
  overWidthChange,
  overFormEvent,
  globalMountedInLogin,
  resetFormEvent,
  outFormEvent,
  initRegistForm,
  resizeEvent,
  sizeInit,
  goSignupEvent,
  goLoginEvent,
};
