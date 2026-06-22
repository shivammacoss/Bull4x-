'use client';

import { useEffect, useState } from 'react';
import { getApiBase } from '@/lib/api/client';

/** Brand-accurate Google "G" logo as inline SVG — no external image, no extra
 * deps. Sourced from Google's identity guidelines (4-color G mark). */
function GoogleLogo() {
  return (
    <svg className="auth-btn--google__logo" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

interface GoogleSignInButtonProps {
  label?: string;
  className?: string;
  disabled?: boolean;
}

/** Renders a "Continue with Google" button only after the backend reports
 * GOOGLE_OAUTH_REDIRECT_URI is configured. Otherwise the button is hidden so
 * users don't get a dead link. The /auth/google/login backend endpoint sets
 * the CSRF cookie and redirects to Google itself. */
export default function GoogleSignInButton({
  label = 'Continue with Google',
  className = '',
  disabled = false,
}: GoogleSignInButtonProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [errorParam, setErrorParam] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          getApiBase() + '/auth/google/status',
          { credentials: 'include' },
        );
        if (!r.ok) return;
        const j = await r.json();
        if (!cancelled) setEnabled(Boolean(j?.enabled));
      } catch {
        if (!cancelled) setEnabled(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Surface ?google_error=... that the backend bounced back on failure.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get('google_error');
    if (err) {
      setErrorParam(err.replace(/_/g, ' '));
      // Clean URL so the message disappears after a successful retry.
      const url = new URL(window.location.href);
      url.searchParams.delete('google_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  if (enabled === false) return null;       // backend says OFF → hide
  if (enabled === null) return null;        // still loading status → hide briefly

  // Full-page redirect (NOT fetch) — Google's consent screen requires top-level
  // navigation, and the backend needs to set an HttpOnly state cookie which a
  // fetch() can't observe.
  const href = getApiBase() + '/auth/google/login';

  return (
    <>
      {errorParam && (
        <div className="auth-google-error" role="alert">
          Google sign-in failed: {errorParam}. Please try again.
        </div>
      )}
      <a
        href={disabled ? undefined : href}
        className={`auth-btn--google ${className}`}
        aria-disabled={disabled}
        onClick={(e) => { if (disabled) e.preventDefault(); }}
      >
        <GoogleLogo />
        <span>{label}</span>
      </a>
    </>
  );
}
