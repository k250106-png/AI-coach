/**
 * Input sanitization utilities to prevent prompt injection and XSS attacks
 */

const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|above)[\s\w]*instructions?/gi,
  /system\s*:/gi,
  /assistant\s*:/gi,
  /user\s*:/gi,
  /forget[\s\w]*you[\s\w]*(?:are|should)/gi,
  /you\s+are\s+now/gi,
  /act\s+as/gi,
  /pretend\s+(?:to\s+)?be/gi,
  /respond\s+(?:only\s+)?as\s+(?:if\s+)?you/gi,
  /disregard[\s\w]*(?:previous|prior|above)/gi,
  /override[\s\w]*(?:your|the)[\s\w]*(?:instruction|rule)/gi,
  /bypass[\s\w]*(?:your|the)[\s\w]*(?:instruction|rule|filter)/gi,
];

const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // event handlers like onclick=
  /<iframe[^>]*>/gi,
];

export function sanitizePromptInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Remove injection patterns
  INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Limit length (prevent DoS)
  sanitized = sanitized.substring(0, 5000);

  return sanitized.trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validateUserId(userId: string): boolean {
  // UUID or standard alphanumeric ID
  const idRegex = /^[a-zA-Z0-9\-_]{20,}$/;
  return idRegex.test(userId);
}

export function validateRole(role: any): role is 'CANDIDATE' | 'RECRUITER' | 'ADMIN' {
  return ['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(role);
}

export function sanitizeFileName(fileName: string): string {
  // Remove/replace dangerous characters
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}

export function validateInterviewLevel(
  level: any
): level is 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' {
  return ['JUNIOR', 'MID', 'SENIOR', 'LEAD'].includes(level);
}

export function validateInterviewRole(role: any): role is string {
  // Accept any non-empty string, sanitize it
  return typeof role === 'string' && role.trim().length > 0 && role.length <= 100;
}
