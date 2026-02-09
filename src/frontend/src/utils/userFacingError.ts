/**
 * Converts backend errors (including trap messages) into user-friendly English messages
 * suitable for display in bootstrap and registration UIs.
 */
export function getUserFacingErrorMessage(error: Error | null | unknown): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Handle Internet Identity / AuthClient errors
  if (errorMessage.includes('AuthClient is not initialized')) {
    return 'Authentication system is still initializing. Please wait a moment and try again.';
  }

  if (errorMessage.includes('User is already authenticated')) {
    return 'You are already signed in. Please sign out first if you want to use a different account.';
  }

  if (errorMessage.includes('Identity not found after successful login')) {
    return 'Login completed but identity could not be retrieved. Please try again.';
  }

  if (errorMessage.includes('Login failed') || errorMessage.includes('onError')) {
    return 'Login failed. This may be due to a popup blocker or the login window being closed. Please try again.';
  }

  if (errorMessage.includes('Initialization failed')) {
    return 'Authentication system failed to initialize. Please refresh the page and try again.';
  }

  if (errorMessage.includes('popup') || errorMessage.includes('window closed')) {
    return 'Login popup was blocked or closed. Please allow popups for this site and try again.';
  }

  // Handle common backend trap messages
  if (errorMessage.includes('Unauthorized')) {
    return 'Authorization error. Please sign in again.';
  }

  if (errorMessage.includes('already registered')) {
    return 'You already have a profile registered.';
  }

  if (errorMessage.includes('Username already taken')) {
    return 'This username is already taken. Please choose another.';
  }

  if (errorMessage.includes('Username') && errorMessage.includes('reserved')) {
    return 'This username is reserved and cannot be used.';
  }

  if (errorMessage.includes('Actor not available')) {
    return 'Connection to the service is not available. Please refresh and try again.';
  }

  if (errorMessage.includes('Registration failed')) {
    return 'Registration failed. Please check your information and try again.';
  }

  if (errorMessage.includes('Invalid registration token')) {
    return 'Invalid admin token. Please check your token and try again.';
  }

  if (errorMessage.includes('Manager already registered')) {
    return 'A manager is already registered. Only one manager account is allowed.';
  }

  if (errorMessage.includes('No user profile found to flush')) {
    return 'No account found to reset. You may have already reset your account.';
  }

  // Return the original message if it's user-friendly enough
  if (errorMessage.length < 100 && !errorMessage.includes('trap') && !errorMessage.includes('canister')) {
    return errorMessage;
  }

  // Generic fallback
  return 'An error occurred. Please try again or contact support if the problem persists.';
}
