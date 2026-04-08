/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  /** Optional OAuth redirect (defaults to `window.location.origin` + `/`). */
  readonly VITE_AUTH_REDIRECT_URL?: string;
}
