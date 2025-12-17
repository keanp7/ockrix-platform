/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input to prevent XSS, injection attacks, etc.
 */

/**
 * Sanitize HTML string to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs that could contain scripts
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize text input - removes HTML tags and dangerous characters
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const div = document.createElement('div');
  div.textContent = sanitized;
  sanitized = div.textContent || div.innerText || '';
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized.trim();
}

/**
 * Sanitize email address
 * Validates format and removes dangerous characters
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  // Remove whitespace
  let sanitized = email.trim().toLowerCase();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove dangerous characters (keep only valid email characters)
  sanitized = sanitized.replace(/[^a-z0-9@._+-]/gi, '');
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except + at the start
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove HTML tags
  let sanitized = phone.replace(/<[^>]*>/g, '');
  
  // Remove whitespace
  sanitized = sanitized.trim();
  
  // Allow + at start, then only digits
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.slice(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }
  
  // Validate length (minimum 10 digits)
  const digits = sanitized.replace(/\D/g, '');
  if (digits.length < 10) {
    throw new Error('Phone number too short');
  }
  
  return sanitized;
}

/**
 * Sanitize URL
 * Validates and sanitizes URLs to prevent javascript: and data: protocols
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  
  // Remove whitespace
  let sanitized = url.trim();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (sanitized.toLowerCase().startsWith(protocol)) {
      throw new Error('Invalid URL protocol');
    }
  }
  
  // Only allow http:// and https://
  if (!sanitized.match(/^https?:\/\//i)) {
    sanitized = 'https://' + sanitized;
  }
  
  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize recovery token
 * Ensures token contains only valid base64 characters
 */
export function sanitizeToken(token: string): string {
  if (!token) return '';
  
  // Remove whitespace
  let sanitized = token.trim();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Only allow base64 characters (alphanumeric, +, /, =)
  sanitized = sanitized.replace(/[^A-Za-z0-9+/=]/g, '');
  
  // Minimum length check
  if (sanitized.length < 20) {
    throw new Error('Token too short');
  }
  
  return sanitized;
}

/**
 * Sanitize session ID
 * Ensures session ID is valid format
 */
export function sanitizeSessionId(sessionId: string): string {
  if (!sessionId) return '';
  
  // Remove whitespace
  let sanitized = sessionId.trim();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Only allow alphanumeric, underscores, and hyphens
  sanitized = sanitized.replace(/[^A-Za-z0-9_-]/g, '');
  
  // Maximum length check (prevent DoS)
  if (sanitized.length > 128) {
    sanitized = sanitized.substring(0, 128);
  }
  
  return sanitized;
}

/**
 * Escape HTML entities
 * Converts dangerous characters to HTML entities
 */
export function escapeHTML(text: string): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize user input for display
 * Combination of sanitization and escaping
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return '';
  
  // First sanitize
  let sanitized = sanitizeText(input);
  
  // Then escape
  sanitized = escapeHTML(sanitized);
  
  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized;
}

/**
 * Validate input length
 * Prevents DoS attacks via extremely long inputs
 */
export function validateLength(
  input: string,
  minLength: number = 0,
  maxLength: number = 1000
): boolean {
  if (!input) return minLength === 0;
  
  const length = input.length;
  return length >= minLength && length <= maxLength;
}

/**
 * Remove null bytes and control characters
 */
export function removeControlChars(input: string): string {
  if (!input) return '';
  
  // Remove null bytes
  let cleaned = input.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  return cleaned;
}
