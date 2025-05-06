import { error } from 'console';
import { router } from './router.js';

/* DOM constants */
const PROFILE_ID = 'profile';
const USERNAME_ID = 'username';
const ALIAS_ID = 'alias';
const DESCRIPTION_ID = 'description';
const SAVE_ID = 'saveProfile';
const ERROR_ID = 'error-message';

/* public entry point */
export function initProfile(): void {
  if (!document.getElementById(PROFILE_ID)) return;

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initializeProfile)
    : initializeProfile();
}

/* helper – grab username from localStorage */
function getUsername(): string {
  const raw = localStorage.getItem('user');
  if (!raw) return '';
  try {
    return JSON.parse(raw).username ?? '';
  } catch (err) {
    console.error('Bad JSON in localStorage “user”', err);
    return '';
  }
}

/* main */
async function initializeProfile(): Promise<void> {
  const usernameSpan = document.getElementById(USERNAME_ID) as HTMLSpanElement | null;
  const aliasField = document.getElementById(ALIAS_ID) as HTMLElement | null;
  const descField = document.getElementById(DESCRIPTION_ID) as HTMLElement | null;
  const saveBtn = document.getElementById(SAVE_ID) as HTMLButtonElement | null;
  const errorEl = document.getElementById(ERROR_ID) as HTMLElement | null;

  if (!usernameSpan || !aliasField || !descField || !saveBtn) {
    errorEl && showError(errorEl, 'Required DOM elements not found');
    return;
  }

  /* make alias & description editable */
  aliasField.contentEditable = 'true';
  descField.contentEditable = 'true';

  const username = getUsername();
  if (!username) {
    router.loadView('login');
    return;
  }
  usernameSpan.textContent = username;
  /* load profile */
  try {
    const res = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
    console.log('after fetch', res)
    if (!res.ok && res.status !== 404) {
      throw new Error((await res.json()).error ?? 'Failed to load profile');
    }
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        aliasField.textContent = data.alias ?? '';
        descField.textContent = data.description ?? '';
        console.log(data.alias)

      }
    }
  } catch (err) {
    errorEl && showError(errorEl, err instanceof Error ? err.message : String(err));
  }

  /* save handler */
  saveBtn.disabled = false;
  saveBtn.addEventListener('click', () =>
    handleSave(username, aliasField, descField, saveBtn, errorEl)
  );
}

async function handleSave(
  username: string,
  aliasField: HTMLElement,
  descField: HTMLElement,
  saveBtn: HTMLButtonElement,
  errorEl: HTMLElement | null
): Promise<void> {
  try {
    saveBtn.disabled = true;
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        alias: aliasField.textContent ?? '',
        description: descField.textContent ?? '',
      }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to save profile');
    errorEl && hideError(errorEl);
    alert('Profile updated successfully!');
  } catch (err) {
    errorEl && showError(errorEl, err instanceof Error ? err.message : String(err));
  } finally {
    saveBtn.disabled = false;
  }
}

/* error helpers */
function showError(el: HTMLElement, msg: string) {
  el.textContent = msg;
  el.style.display = 'block';
}
function hideError(el: HTMLElement) {
  el.style.display = 'none';
}

/* auto‑run if loaded directly */
if (import.meta.url === new URL(import.meta.url).href) {
  initProfile();
}
