import * as path from 'path';

/** Directory and file paths for persisted authentication state. */
export const AUTH_DIR = path.resolve(__dirname, '..', 'playwright', '.auth');

/** Cookies + localStorage (Playwright's native storageState). */
export const STORAGE_STATE_PATH = path.join(AUTH_DIR, 'user.json');

/** sessionStorage snapshot (saved separately — storageState does not include it). */
export const SESSION_STORAGE_PATH = path.join(AUTH_DIR, 'session.json');
