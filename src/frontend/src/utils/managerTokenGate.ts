/**
 * Session-based manager token storage utility.
 * Manages token storage and gate messages in sessionStorage.
 */

const MANAGER_TOKEN_KEY = 'caffeineAdminToken';
const MANAGER_GATE_MESSAGE_KEY = 'caffeineManagerGateMessage';

// Token storage
export function setStoredManagerToken(token: string): void {
  sessionStorage.setItem(MANAGER_TOKEN_KEY, token);
}

export function getStoredManagerToken(): string | null {
  return sessionStorage.getItem(MANAGER_TOKEN_KEY);
}

export function clearStoredManagerToken(): void {
  sessionStorage.removeItem(MANAGER_TOKEN_KEY);
}

// Gate message
export function setGateMessage(message: string): void {
  sessionStorage.setItem(MANAGER_GATE_MESSAGE_KEY, message);
}

export function getGateMessage(): string | null {
  return sessionStorage.getItem(MANAGER_GATE_MESSAGE_KEY);
}

export function clearGateMessage(): void {
  sessionStorage.removeItem(MANAGER_GATE_MESSAGE_KEY);
}

// Combined operations
export function clearAllManagerGateState(): void {
  clearStoredManagerToken();
  clearGateMessage();
}
