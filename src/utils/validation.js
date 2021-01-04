// 비밀번호 체크
function passwordValidation(password) {
  //const regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,10}$/; //  8 ~ 10자 영문, 숫자 조합
  const re = /^[0-9]+$/; // 숫자만 입력
  return re.test(password) && password.length >= 6;
}

// 이메일 체크
function emailValidation(email) {
  const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regExp.test(email);
}

// 영문 체크
function engValidation(email) {
  const eng = /^[a-zA-Z]*$/;

  return eng.test(email);
}

// 닉네임 체크
function nicknameValidation(nickname) {
  return nickname.length > 2 && nickname.length < 10;
}

export {
  passwordValidation,
  emailValidation,
  engValidation,
  nicknameValidation,
};
