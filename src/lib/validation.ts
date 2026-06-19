const SEQUENTIAL_NUMBERS = [
  "0123456789",
  "9876543210",
];

const KEYBOARD_ROWS = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "1234567890",
];

function countCharTypes(password: string): number {
  let types = 0;
  if (/[A-Z]/.test(password)) types++;
  if (/[a-z]/.test(password)) types++;
  if (/[0-9]/.test(password)) types++;
  if (/[^A-Za-z0-9]/.test(password)) types++;
  return types;
}

function hasSequentialPattern(password: string): boolean {
  const lower = password.toLowerCase();
  for (const seq of [...SEQUENTIAL_NUMBERS, ...KEYBOARD_ROWS]) {
    for (let i = 0; i <= seq.length - 4; i++) {
      if (lower.includes(seq.slice(i, i + 4))) return true;
    }
  }
  return false;
}

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePassword(
  password: string,
  email?: string
): PasswordValidationResult {
  const len = password.length;
  const types = countCharTypes(password);

  if (len < 8) {
    return { valid: false, error: "비밀번호는 최소 8자 이상이어야 합니다." };
  }

  if (len < 10 && types < 3) {
    return {
      valid: false,
      error:
        "8~9자 비밀번호는 대문자, 소문자, 숫자, 특수문자 중 3종류 이상을 포함해야 합니다.",
    };
  }

  if (len >= 10 && types < 2) {
    return {
      valid: false,
      error:
        "비밀번호는 대문자, 소문자, 숫자, 특수문자 중 2종류 이상을 포함해야 합니다.",
    };
  }

  if (hasSequentialPattern(password)) {
    return {
      valid: false,
      error: "연속된 숫자나 키보드 나열 문자열은 사용할 수 없습니다.",
    };
  }

  if (email) {
    const emailId = email.split("@")[0].toLowerCase();
    if (emailId.length >= 4 && password.toLowerCase().includes(emailId)) {
      return {
        valid: false,
        error: "비밀번호에 이메일 아이디를 포함할 수 없습니다.",
      };
    }
  }

  return { valid: true };
}
