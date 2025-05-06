import { router } from './router.js';

/**
 * DOM‑ID constants keep selectors in one place.
 */
const PROFILE_ID = 'profile';
const USERNAME_SPAN_ID = 'username';
const ALIAS_INPUT_ID = 'alias';
const DESCRIPTION_INPUT_ID = 'description';
const SAVE_BUTTON_ID = 'saveProfile';
const ERROR_ID = 'error-message';

/**
 * Entry point ‑ runs automatically when this module is imported directly.
 */
export function initProfile(): void {
  // Only run on the profile page
  if (!document.getElementById(PROFILE_ID)) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProfile);
  } else {
    initializeProfile();
  }
}

/**
 * Extract the username from localStorage as a plain string.
 */
function getUsername(): string {
  const stored = localStorage.getItem('user');
  if (!stored) return '';

  try {
    return JSON.parse(stored).username ?? '';
  } catch (err) {
    console.error('Invalid JSON in localStorage "user":', err);
    return '';
  }
}

/**
 * Set up the profile page once the DOM is ready.
 */
async function initializeProfile(): Promise<void> {
  const usernameEl = document.getElementById(USERNAME_SPAN_ID) as HTMLSpanElement | null;
  const aliasInput = document.getElementById(ALIAS_INPUT_ID) as HTMLInputElement | null;
  const descInput = document.getElementById(DESCRIPTION_INPUT_ID) as HTMLTextAreaElement | null;
  const saveBtn = document.getElementById(SAVE_BUTTON_ID) as HTMLButtonElement | null;
  const errEl = document.getElementById(ERROR_ID) as HTMLElement | null;

  if (!usernameEl || !aliasInput || !descInput || !saveBtn) {
    errEl && showError(errEl, 'Required DOM elements not found');
    return;
  }

  const username = getUsername();
  if (!username) {
    router.loadView('login');
    return;
  }

  usernameEl.textContent = username;

  try {
    const res = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      if (res.status !== 404) {
        throw new Error((await res.json()).error ?? 'Failed to load profile');
      }
    } else {
      const data = await res.json();
      if (data && typeof data === 'object') {
        aliasInput.value = data.alias ?? '';
        descInput.value = data.description ?? '';
      }
    }
  } catch (err) {
    errEl && showError(errEl, err instanceof Error ? err.message : String(err));
  } finally {
    enableForm(aliasInput, descInput, saveBtn);
  }

  saveBtn.addEventListener('click', () =>
    handleSave(username, aliasInput, descInput, saveBtn, errEl)
  );
}

/**
 * POST profile updates to the server.
 */
async function handleSave(
  username: string,
  aliasInput: HTMLInputElement,
  descInput: HTMLTextAreaElement,
  saveBtn: HTMLButtonElement,
  errEl: HTMLElement | null
): Promise<void> {
  try {
    saveBtn.disabled = true;
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        alias: aliasInput.value,
        description: descInput.value,
      }),
    });

    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to save profile');

    errEl && hideError(errEl);
    alert('Profile updated successfully!');
  } catch (err) {
    errEl && showError(errEl, err instanceof Error ? err.message : String(err));
  } finally {
    saveBtn.disabled = false;
  }
}

/**
 * Utility helpers
 */
function enableForm(
  ...elements: (HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement)[]
): void {
  elements.forEach(el => (el.disabled = false));
}

function showError(el: HTMLElement, msg: string): void {
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(el: HTMLElement): void {
  el.style.display = 'none';
}

/**
 * Auto‑initialise when the script is loaded directly.
 */
if (import.meta.url === new URL(import.meta.url).href) {
  initProfile();
}
