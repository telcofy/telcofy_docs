const STORAGE_KEY = 'telcofy.cookie-consent';

/**
 * Bump when the cookie policy materially changes — a stored decision from an
 * older version is treated as undecided, so visitors are asked again.
 */
const POLICY_VERSION = 1;

export const OPEN_SETTINGS_EVENT = 'telcofy:open-cookie-settings';

export type ConsentState = 'granted' | 'denied';

/** Fallback when localStorage is unavailable (private mode, blocked storage). */
let memoryConsent: ConsentState | null = null;

/** The visitor's decision, or null when they have not decided yet. */
export function readConsent(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      if (stored?.version !== POLICY_VERSION) return null;
      return stored.analytics ? 'granted' : 'denied';
    }
  } catch {
    // Storage unreadable — fall back to whatever was decided this session.
  }

  return memoryConsent;
}

export function writeConsent(granted: boolean): void {
  memoryConsent = granted ? 'granted' : 'denied';

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: POLICY_VERSION,
        analytics: granted,
        decidedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Storage unwritable — the decision still holds for this page load.
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'granted';
}

/** Re-open the banner so a visitor can change or withdraw their decision. */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
