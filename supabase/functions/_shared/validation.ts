// Shared validation utilities for edge functions

/**
 * Validates string input with length limits
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): string | null {
  const { minLength = 0, maxLength = 10000, required = false } = options;

  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (required && trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }

  if (trimmed.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`);
  }

  return trimmed;
}

/**
 * Validates array input
 */
export function validateArray(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number; required?: boolean } = {}
): unknown[] | null {
  const { maxLength = 100, required = false } = options;

  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return null;
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }

  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${maxLength} items`);
  }

  return value;
}

/**
 * Validates boolean input
 */
export function validateBoolean(
  value: unknown,
  fieldName: string,
  options: { defaultValue?: boolean } = {}
): boolean {
  const { defaultValue } = options;

  if (value === undefined || value === null) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return false;
  }

  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }

  return value;
}

/**
 * Validates number input
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean; defaultValue?: number } = {}
): number | null {
  const { min, max, required = false, defaultValue } = options;

  if (value === undefined || value === null) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (min !== undefined && value < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`);
  }

  return value;
}

/**
 * Validates enum input
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  validValues: readonly T[],
  options: { required?: boolean; defaultValue?: T } = {}
): T | null {
  const { required = false, defaultValue } = options;

  if (value === undefined || value === null) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return null;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  if (!validValues.includes(value as T)) {
    throw new ValidationError(`${fieldName} must be one of: ${validValues.join(', ')}`);
  }

  return value as T;
}

/**
 * Validates URL input
 */
export function validateUrl(
  value: unknown,
  fieldName: string,
  options: { required?: boolean; allowedProtocols?: string[] } = {}
): string | null {
  const { required = false, allowedProtocols = ['http:', 'https:'] } = options;

  const str = validateString(value, fieldName, { required, maxLength: 2048 });
  
  if (str === null) {
    return null;
  }

  try {
    const url = new URL(str);
    if (!allowedProtocols.includes(url.protocol)) {
      throw new ValidationError(`${fieldName} must use protocol: ${allowedProtocols.join(', ')}`);
    }
    return str;
  } catch (e) {
    if (e instanceof ValidationError) throw e;
    throw new ValidationError(`${fieldName} must be a valid URL`);
  }
}

/**
 * Validates message array for chat endpoints
 */
export function validateChatMessages(
  value: unknown,
  options: { maxMessages?: number; maxContentLength?: number } = {}
): Array<{ role: string; content: string }> {
  const { maxMessages = 100, maxContentLength = 50000 } = options;

  const messages = validateArray(value, 'messages', { required: true, maxLength: maxMessages });
  
  if (!messages) {
    throw new ValidationError('messages is required');
  }

  return messages.map((msg, index) => {
    if (typeof msg !== 'object' || msg === null) {
      throw new ValidationError(`messages[${index}] must be an object`);
    }

    const msgObj = msg as Record<string, unknown>;
    
    const role = validateEnum(msgObj.role, `messages[${index}].role`, ['user', 'assistant', 'system'] as const, { required: true });
    const content = validateString(msgObj.content, `messages[${index}].content`, { required: true, maxLength: maxContentLength });

    return { role: role!, content: content! };
  });
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitizes text content by removing potentially dangerous patterns
 */
export function sanitizeText(text: string): string {
  // Remove null bytes
  let sanitized = text.replace(/\0/g, '');
  
  // Limit consecutive whitespace
  sanitized = sanitized.replace(/\s{10,}/g, '          ');
  
  return sanitized;
}

/**
 * Validates document context object
 */
export function validateDocumentContext(
  value: unknown
): Record<string, unknown> | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('documentContext must be an object');
  }

  const ctx = value as Record<string, unknown>;

  // Validate known fields if present
  if (ctx.fileName !== undefined) {
    validateString(ctx.fileName, 'documentContext.fileName', { maxLength: 255 });
  }

  if (ctx.extractedText !== undefined) {
    validateString(ctx.extractedText, 'documentContext.extractedText', { maxLength: 100000 });
  }

  if (ctx.riskScore !== undefined) {
    validateNumber(ctx.riskScore, 'documentContext.riskScore', { min: 0, max: 100 });
  }

  return ctx;
}

/**
 * Creates a validation response for invalid input
 */
export function createValidationErrorResponse(
  error: ValidationError,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ 
      error: error.message, 
      code: 'VALIDATION_ERROR' 
    }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
