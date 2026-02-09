// Manager token gating utility
// Manages per-session validation flag, gate messages, and token storage

const SESSION_KEY_VALIDATED = 'caffeineManagerTokenValidated';
const SESSION_KEY_GATE_MESSAGE = 'caffeineManagerGateMessage';
const SESSION_KEY_TOKEN = 'caffeineAdminToken';

// Session validation flag management
export function setManagerTokenValidated(): void {
  sessionStorage.setItem(SESSION_KEY_VALIDATED, 'true');
}

export function isManagerTokenValidated(): boolean {
  return sessionStorage.getItem(SESSION_KEY_VALIDATED) === 'true';
}

export function clearManagerTokenValidated(): void {
  sessionStorage.removeItem(SESSION_KEY_VALIDATED);
}

// Gate message management
export function setGateMessage(message: string): void {
  sessionStorage.setItem(SESSION_KEY_GATE_MESSAGE, message);
}

export function getGateMessage(): string | null {
  return sessionStorage.getItem(SESSION_KEY_GATE_MESSAGE);
}

export function clearGateMessage(): void {
  sessionStorage.removeItem(SESSION_KEY_GATE_MESSAGE);
}

// Token storage management
export function getStoredManagerToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY_TOKEN);
}

export function setStoredManagerToken(token: string): void {
  sessionStorage.setItem(SESSION_KEY_TOKEN, token);
}

export function clearStoredManagerToken(): void {
  sessionStorage.removeItem(SESSION_KEY_TOKEN);
}

// Clear all manager gate state
export function clearAllManagerGateState(): void {
  clearManagerTokenValidated();
  clearGateMessage();
  clearStoredManagerToken();
}

// Clear manager gate state for retry (keeps message temporarily for display)
export function clearManagerGateStateForRetry(): void {
  clearManagerTokenValidated();
  clearStoredManagerToken();
}
