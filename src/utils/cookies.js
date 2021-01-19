// Registration.vue
// save
function saveAuth(name, value) {
  document.cookie = `${name}=${value}`;
}

// get user email
function getUserEmail() {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)user_email\s*=\s*([^;]*).*$)|^.*$/,
    '$1',
  );
}

// get user uid
function getUserUid() {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)user_uid\s*=\s*([^;]*).*$)|^.*$/,
    '$1',
  );
}

// get user nickname
function getUserNickname() {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)user_nickname\s*=\s*([^;]*).*$)|^.*$/,
    '$1',
  );
}

// get router path
function getCurrentRouter() {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)cur_path\s*=\s*([^;]*).*$)|^.*$/,
    '$1',
  );
}

// 계산된 cash/bankArr
function getCalculatedValues() {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)calculated\s*=\s*([^;]*).*$)|^.*$/,
    '$1',
  );
}

// delete
function deleteCookie(value) {
  document.cookie = `${value}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export {
  saveAuth,
  getUserEmail,
  getUserUid,
  getUserNickname,
  deleteCookie,
  getCurrentRouter,
  getCalculatedValues,
};
