export const checkPasswordRules = (password = '') => {
  const minLength = password.length >= 8 && password.length <= 64;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpperLower = hasUpper && hasLower;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`;']/.test(password);
  const noSpace = password.length > 0 && !/\s/.test(password);

  const score = [minLength, hasUpperLower, hasNumber, hasSpecial].filter(Boolean).length;

  let errorMessage = '';
  if (!password) {
    errorMessage = 'Vui lòng nhập mật khẩu.';
  } else if (/\s/.test(password)) {
    errorMessage = 'Mật khẩu không được chứa khoảng trắng.';
  } else if (password.length < 8) {
    errorMessage = 'Mật khẩu phải có ít nhất 8 ký tự.';
  } else if (password.length > 64) {
    errorMessage = 'Mật khẩu không được vượt quá 64 ký tự.';
  } else if (!hasUpper) {
    errorMessage = 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa (A-Z).';
  } else if (!hasLower) {
    errorMessage = 'Mật khẩu phải chứa ít nhất 1 chữ cái viết thường (a-z).';
  } else if (!hasNumber) {
    errorMessage = 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).';
  } else if (!hasSpecial) {
    errorMessage = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, #, $, !, %...).';
  }

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial && noSpace;

  return {
    minLength,
    hasUpper,
    hasLower,
    hasUpperLower,
    hasNumber,
    hasSpecial,
    noSpace,
    score,
    isValid,
    valid: isValid,
    errorMessage,
    firstError: errorMessage,
    checks: {
      minLength,
      hasUpper,
      hasLower,
      hasUpperLower,
      hasNumber,
      hasSpecial,
      noSpace,
    },
  };
};
