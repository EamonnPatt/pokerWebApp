import { router } from './router.js';
/**
 * DOM‑ID constants keep selectors in one place.
 */
const PROFILE_ID = 'profile';
const USERNAME_ID = 'username';
const ALIAS_ID = 'alias';
const DESCRIPTION_ID = 'description';
const SAVE_ID = 'saveProfile';
const ERROR_ID = 'error-message';
/**
 * Entry point – automatically runs when this module is imported directly.
 */
export function initProfile() {
    // Only run on the profile page
    if (!document.getElementById(PROFILE_ID))
        return;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProfile);
    }
    else {
        initializeProfile();
    }
}
/**
 * Extract the username from localStorage as a plain string.
 */
function getUsername() {
    const stored = localStorage.getItem('user');
    if (!stored)
        return '';
    try {
        return JSON.parse(stored).username ?? '';
    }
    catch (err) {
        console.error('Invalid JSON in localStorage "user":', err);
        return '';
    }
}
/**
 * Main setup once the DOM is ready.
 */
async function initializeProfile() {
    const usernameSpan = document.getElementById(USERNAME_ID);
    const aliasField = document.getElementById(ALIAS_ID);
    const descField = document.getElementById(DESCRIPTION_ID);
    const saveBtn = document.getElementById(SAVE_ID);
    const errEl = document.getElementById(ERROR_ID);
    if (!usernameSpan || !aliasField || !descField || !saveBtn) {
        errEl && showError(errEl, 'Required DOM elements not found');
        return;
    }
    // Make alias & description editable in‑place.
    aliasField.contentEditable = 'true';
    descField.contentEditable = 'true';
    const username = getUsername();
    if (!username) {
        router.loadView('login');
        return;
    }
    usernameSpan.textContent = username;
    // ─── Load profile data ─────────────────────────────────────────────
    try {
        const res = await fetch(`/api/profile?username=${encodeURIComponent(username)}`);
        if (!res.ok) {
            if (res.status !== 404) {
                throw new Error((await res.json()).error ?? 'Failed to load profile');
            }
        }
        else {
            const data = await res.json();
            if (data && typeof data === 'object') {
                aliasField.textContent = data.alias ?? '';
                descField.textContent = data.description ?? '';
            }
        }
    }
    catch (err) {
        errEl && showError(errEl, err instanceof Error ? err.message : String(err));
    }
    // ─── Save handler ─────────────────────────────────────────────────
    saveBtn.disabled = false; // always allow saving
    saveBtn.addEventListener('click', () => handleSave(username, aliasField, descField, saveBtn, errEl));
}
/**
 * POST profile updates to the server.
 */
async function handleSave(username, aliasField, descField, saveBtn, errEl) {
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
        if (!res.ok)
            throw new Error((await res.json()).error ?? 'Failed to save profile');
        errEl && hideError(errEl);
        alert('Profile updated successfully!');
    }
    catch (err) {
        errEl && showError(errEl, err instanceof Error ? err.message : String(err));
    }
    finally {
        saveBtn.disabled = false;
    }
}
/**
 * Error‑handling helpers
 */
function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
}
function hideError(el) {
    el.style.display = 'none';
}
/**
 * Auto‑initialise when the script is loaded directly.
 */
if (import.meta.url === new URL(import.meta.url).href) {
    initProfile();
}
