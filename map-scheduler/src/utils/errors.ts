/**
 * Error handling utilities for production-ready error messages
 */

export interface FirebaseErrorInfo {
  code: string;
  message: string;
  userMessage: string;
}

export function parseFirebaseError(error: unknown): FirebaseErrorInfo {
  const err = error as any;
  
  // Firebase specific error codes
  const errorCode = err.code || 'unknown';
  const errorMessage = err.message || 'An unknown error occurred';
  
  let userMessage = 'Something went wrong. Please try again.';
  
  // Map Firebase error codes to user-friendly messages
  if (errorCode.includes('permission-denied')) {
    userMessage = 'You don\'t have permission to perform this action.';
  } else if (errorCode.includes('not-found')) {
    userMessage = 'The appointment could not be found.';
  } else if (errorCode.includes('already-exists')) {
    userMessage = 'This appointment already exists.';
  } else if (errorCode.includes('failed-precondition')) {
    userMessage = 'The database is in an invalid state. Please refresh and try again.';
  } else if (errorCode.includes('unauthenticated')) {
    userMessage = 'Please sign in to save appointments.';
  } else if (errorCode.includes('resource-exhausted')) {
    userMessage = 'Too many requests. Please wait a moment and try again.';
  } else if (errorCode.includes('unavailable')) {
    userMessage = 'The service is temporarily unavailable. Please try again later.';
  } else if (errorMessage.includes('offline') || errorMessage.includes('network')) {
    userMessage = 'Network error. Please check your connection and try again.';
  } else if (errorMessage.includes('CORS')) {
    userMessage = 'There was a security issue. Please refresh the page and try again.';
  }
  
  return {
    code: errorCode,
    message: errorMessage,
    userMessage,
  };
}

export function logError(context: string, error: unknown, details?: Record<string, any>) {
  const parsed = parseFirebaseError(error);
  
  // In production, you might send this to a service like Sentry, LogRocket, etc.
  console.error(`[${context}]`, {
    code: parsed.code,
    message: parsed.message,
    userMessage: parsed.userMessage,
    timestamp: new Date().toISOString(),
    ...details,
  });
  
  // Also log to sessionStorage for debugging
  try {
    const logs = JSON.parse(sessionStorage.getItem('errorLogs') || '[]');
    logs.push({
      context,
      ...parsed,
      timestamp: new Date().toISOString(),
      ...details,
    });
    // Keep only last 50 errors
    sessionStorage.setItem('errorLogs', JSON.stringify(logs.slice(-50)));
  } catch {
    // Silently fail if sessionStorage isn't available
  }
}

export function getErrorLogs() {
  try {
    return JSON.parse(sessionStorage.getItem('errorLogs') || '[]');
  } catch {
    return [];
  }
}

export function clearErrorLogs() {
  try {
    sessionStorage.removeItem('errorLogs');
  } catch {
    // Silently fail if sessionStorage isn't available
  }
}
