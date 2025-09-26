// -- Constants ----------------------------------------- //
const SENSITIVE_KEYS = [
  'password',
  'pass',
  'pwd',
  'secret',
  'token',
  'key',
  'auth',
  'authorization',
  'bearer',
  'credential',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
  'private_key',
  'privatekey',
  'mnemonic',
  'seed',
  'phrase',
  'wallet',
  'address',
  'email',
  'phone',
  'ssn',
  'social',
  'credit',
  'card',
  'cvv',
  'connection_string',
  'connection',
  'user_token'
];

const MAX_STRING_LENGTH = 480; // Maximum length for any string value (account for potential replacements)
const MAX_STACK_LINES = 10; // Maximum lines in stack trace

// -- Data Sanitization Functions ---------------------- //
export const sanitizeString = (value: string): string => {
  if (typeof value !== 'string') {
    value = String(value);
  }

  if (value.length > MAX_STRING_LENGTH) {
    return value.substring(0, MAX_STRING_LENGTH) + '... [truncated]';
  }

  return value;
};

export const sanitizeStackTrace = (stack: string): string => {
  if (typeof stack !== 'string') {
    stack = String(stack);
  }

  const lines = stack.split('\n');
  const sanitizedLines = lines.slice(0, MAX_STACK_LINES).map(line => {
    // Remove file paths that might contain sensitive info
    return line.replace(/\/[^\s]*\//g, '/[path]/');
  });

  if (lines.length > MAX_STACK_LINES) {
    sanitizedLines.push('... [stack trace truncated]');
  }

  return sanitizedLines.join('\n');
};

export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove query parameters that might contain sensitive data
    urlObj.search = '';
    // Keep only the origin and pathname

    return urlObj.origin + urlObj.pathname;
  } catch {
    // If URL parsing fails, just return sanitized string

    return sanitizeString(url);
  }
};

const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();

  return SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey));
};

export const sanitizeValue = (value: unknown, visited = new WeakSet()): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    // Check if it looks like a URL
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return sanitizeUrl(value);
    }

    return sanitizeString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    // Prevent circular references in arrays
    if (visited.has(value)) {
      return '[Circular Reference]';
    }

    visited.add(value);
    const result = value.slice(0, 10).map(item => sanitizeValue(item, visited));
    visited.delete(value);

    return result;
  }

  if (typeof value === 'object') {
    return sanitizeObject(value as Record<string, unknown>, visited);
  }

  // For other types, convert to string and sanitize
  return sanitizeString(String(value));
};

export const sanitizeObject = (
  obj: Record<string, unknown>,
  visited = new WeakSet()
): Record<string, unknown> => {
  // Prevent circular references
  if (visited.has(obj)) {
    return { '[Circular Reference]': true };
  }

  visited.add(obj);

  const sanitized: Record<string, unknown> = {};
  const keys = Object.keys(obj).slice(0, 20); // Limit number of keys

  for (const key of keys) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeValue(obj[key], visited);
    }
  }

  if (Object.keys(obj).length > 20) {
    sanitized['...'] = '[additional properties truncated]';
  }

  visited.delete(obj);

  return sanitized;
};

export const sanitizeData = (
  data?: Record<string, unknown>
): Record<string, unknown> | undefined => {
  if (!data) {
    return undefined;
  }

  return sanitizeObject(data);
};

// -- Utility Functions --------------------------------- //
export const LogUtils = {
  sanitizeString,
  sanitizeStackTrace,
  sanitizeUrl,
  sanitizeValue,
  sanitizeObject,
  sanitizeData
};
