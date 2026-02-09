/**
 * Converts backend errors (including trap messages) into user-friendly English messages
 * suitable for display in bootstrap and registration UIs.
 */
export function getUserFacingErrorMessage(error: Error | null | unknown): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

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

  // Return the original message if it's user-friendly enough
  if (errorMessage.length < 100 && !errorMessage.includes('trap') && !errorMessage.includes('canister')) {
    return errorMessage;
  }

  // Generic fallback
  return 'An error occurred. Please try again or contact support if the problem persists.';
}
