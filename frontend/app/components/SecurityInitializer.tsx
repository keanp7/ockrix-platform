'use client';

/**
 * Security Initializer Component
 * 
 * Initializes security checks on app startup
 */

import { useEffect } from 'react';
import { initializeSecurity, logSecurityWarnings } from '../lib/security/middleware';
import { validateEnvironment } from '../lib/security/environment';

export function SecurityInitializer() {
  useEffect(() => {
    // Initialize security checks
    initializeSecurity();
    
    // Log security warnings in development
    logSecurityWarnings();
    
    // Validate environment
    const envCheck = validateEnvironment();
    if (!envCheck.valid) {
      console.warn('Environment validation warnings:', envCheck.errors);
    }
  }, []);

  // This component doesn't render anything
  return null;
}
