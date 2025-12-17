/**
 * Secure Input Component
 * 
 * Input component with built-in sanitization
 */

'use client';

import { InputHTMLAttributes, useState, useCallback } from 'react';
import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeToken,
  validateLength,
} from '../lib/security/sanitization';

interface SecureInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  type?: 'text' | 'email' | 'tel' | 'password' | 'token';
  sanitize?: boolean;
  maxLength?: number;
  minLength?: number;
  onSanitizedChange?: (value: string) => void;
}

export default function SecureInput({
  type = 'text',
  sanitize: enableSanitization = true,
  maxLength = 1000,
  minLength = 0,
  onChange,
  onSanitizedChange,
  ...props
}: SecureInputProps) {
  const [error, setError] = useState<string>('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      if (enableSanitization) {
        try {
          // Sanitize based on input type
          switch (type) {
            case 'email':
              value = sanitizeEmail(value);
              break;
            case 'tel':
              value = sanitizePhone(value);
              break;
            case 'token':
              value = sanitizeToken(value);
              break;
            default:
              value = sanitizeText(value);
          }

          // Validate length
          if (!validateLength(value, minLength, maxLength)) {
            setError(
              `Input must be between ${minLength} and ${maxLength} characters`
            );
            return;
          }

          setError('');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Invalid input');
          return;
        }
      }

      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }

      // Call sanitized change handler
      if (onSanitizedChange) {
        onSanitizedChange(value);
      }
    },
    [type, enableSanitization, minLength, maxLength, onChange, onSanitizedChange]
  );

  return (
    <div className="w-full">
      <input
        {...props}
        type={type === 'token' ? 'text' : type}
        onChange={handleChange}
        maxLength={maxLength}
        className={`${props.className || ''} ${error ? 'border-brand-error-500' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-brand-error-500">{error}</p>
      )}
    </div>
  );
}
