// 비밀번호 체크
function passwordValidation(password) {
  //const regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,10}$/; //  8 ~ 10자 영문, 숫자 조합
  console.log('이게 패스워드 길이다!!!!', password.length);
  return password.length >= 6;
}

// 이메일 체크
function emailValidation(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export { passwordValidation, emailValidation };
