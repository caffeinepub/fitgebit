/**
 * Centralized utility to clear all client-side session state used for role/token gating.
 * This ensures consistent cleanup across login, logout, and account reset flows.
 */

/**
 * Clears all session storage keys related to role selection and token gating.
 * Use this when signing out, resetting account, or switching roles to prevent stale state.
 */
export function clearAllSessionState(): void {
  // Role selection
  sessionStorage.removeItem('caffeineSelectedRole');
  
  // Manager token gating
  sessionStorage.removeItem('caffeineAdminToken');
  sessionStorage.removeItem('caffeineManagerGateMessage');
}
