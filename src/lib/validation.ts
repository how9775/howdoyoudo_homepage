export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 이메일 정규식
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 한글, 영문, 숫자, 공백만 허용 (이름용)
const NAME_REGEX = /^[가-힣a-zA-Z\s]+$/;

// 허용된 카테고리 목록
const ALLOWED_CATEGORIES = [
  '행사 문의',
  '일반 문의',
  '기타'
];

// 간단한 HTML/스크립트 제거 (DOMPurify 대체)
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  let sanitized = input;
  
  // 1. HTML 태그 제거
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // 2. 스크립트 관련 문자열 제거
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // 3. 특수 HTML 엔티티 제거
  sanitized = sanitized.replace(/&lt;/g, '');
  sanitized = sanitized.replace(/&gt;/g, '');
  sanitized = sanitized.replace(/&quot;/g, '');
  sanitized = sanitized.replace(/&#/g, '');
  
  // 4. 연속된 공백을 하나로
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // 5. 앞뒤 공백 제거
  return sanitized.trim();
}

export function validateContactForm(data: {
  name?: string;
  email?: string;
  category?: string;
  subject?: string;
  message?: string;
  honeypot?: string;
  privacyAgreed?: boolean;
}): ValidationResult {
  const errors: string[] = [];

  // Honeypot 체크 (봇 방지)
  if (data.honeypot && data.honeypot.trim() !== '') {
    return {
      isValid: false,
      errors: ['Invalid submission detected'],
    };
  }

  // 이름 검증
  if (!data.name || data.name.trim().length === 0) {
    errors.push('이름을 입력해주세요.');
  } else if (data.name.length > 50) {
    errors.push('이름은 50자 이내로 입력해주세요.');
  } else if (!NAME_REGEX.test(data.name)) {
    errors.push('이름은 한글, 영문, 공백만 입력 가능합니다.');
  }

  // 이메일 검증
  if (!data.email || data.email.trim().length === 0) {
    errors.push('이메일을 입력해주세요.');
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  } else if (data.email.length > 100) {
    errors.push('이메일은 100자 이내로 입력해주세요.');
  }

  // 카테고리 검증
  if (!data.category || !ALLOWED_CATEGORIES.includes(data.category)) {
    errors.push('유효한 문의 카테고리를 선택해주세요.');
  }

  // 제목 검증
  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('제목을 입력해주세요.');
  } else if (data.subject.length < 5) {
    errors.push('제목은 최소 5자 이상 입력해주세요.');
  } else if (data.subject.length > 100) {
    errors.push('제목은 100자 이내로 입력해주세요.');
  }

  // 메시지 검증
  if (!data.message || data.message.trim().length === 0) {
    errors.push('문의 내용을 입력해주세요.');
  } else if (data.message.length < 10) {
    errors.push('문의 내용은 최소 10자 이상 입력해주세요.');
  } else if (data.message.length > 2000) {
    errors.push('문의 내용은 2000자 이내로 입력해주세요.');
  }

  // 개인정보 동의 검증
  if (!data.privacyAgreed) {
    errors.push('개인정보 수집 및 이용에 동의해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// IP 주소 추출 (프록시 뒤에 있을 경우 고려)
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}