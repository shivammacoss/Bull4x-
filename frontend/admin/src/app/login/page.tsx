'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuthRehydrated } from '@/hooks/useAuthRehydrated';

export default function LoginPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuthStore();
  const authRehydrated = useAuthRehydrated();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authRehydrated) return;
    if (checkAuth()) router.replace('/dashboard');
  }, [authRehydrated, checkAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!authRehydrated) {
    return (
      <div className="relative min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Loader2 size={24} className="animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="admin-login relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* Decorative background */}
      <div className="admin-login__orb admin-login__orb--1" />
      <div className="admin-login__orb admin-login__orb--2" />
      <div className="admin-login__grid" />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="admin-login__logo-tile">
            <img src="/images/bull4x_logo.jpeg" alt="Bull4x" className="w-14 h-14 object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mt-5">
            <span>Bull</span><span className="admin-login__brand-accent">4x</span> Admin
          </h1>
          <p className="text-xs text-text-tertiary mt-1.5 tracking-wide uppercase">Broker Administration Panel</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="admin-login__card space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail size={15} className="admin-login__field-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bull4x.com"
                required
                className="admin-login__field"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={15} className="admin-login__field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                className="admin-login__field admin-login__field--pw"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-text-tertiary hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-sell bg-sell/10 border border-sell/20 rounded-md px-3 py-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="admin-login__btn">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xxs text-text-tertiary mt-6 tracking-wide">
          Bull4x Admin v1.0 &middot; Secure Access Only
        </p>
      </div>

      <style jsx>{`
        .admin-login {
          background:
            radial-gradient(ellipse 70% 60% at 50% -10%, rgba(0, 230, 118, 0.10) 0%, transparent 55%),
            #06090a;
        }
        .admin-login__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .admin-login__orb--1 {
          width: 460px; height: 460px;
          top: -160px; left: -120px;
          background: radial-gradient(circle, rgba(0, 230, 118, 0.22) 0%, transparent 70%);
        }
        .admin-login__orb--2 {
          width: 420px; height: 420px;
          bottom: -160px; right: -120px;
          background: radial-gradient(circle, rgba(0, 200, 200, 0.16) 0%, transparent 70%);
        }
        .admin-login__grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.4;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, #000 0%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, #000 0%, transparent 80%);
        }
        .admin-login__logo-tile {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(0, 230, 118, 0.25);
          box-shadow: 0 0 40px rgba(0, 230, 118, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }
        .admin-login__brand-accent {
          background: linear-gradient(135deg, #33eb91 0%, #00e676 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .admin-login__card {
          position: relative;
          padding: 26px 24px;
          border-radius: 20px;
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.015) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 230, 118, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .admin-login__field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #5b6b66;
          pointer-events: none;
        }
        .admin-login__field {
          width: 100%;
          padding: 11px 14px 11px 38px;
          font-size: 0.875rem;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .admin-login__field--pw { padding-right: 40px; }
        .admin-login__field::placeholder { color: #4b5563; }
        .admin-login__field:hover { border-color: rgba(255, 255, 255, 0.18); }
        .admin-login__field:focus {
          border-color: #00e676;
          background: rgba(0, 230, 118, 0.04);
          box-shadow: 0 0 0 3px rgba(0, 230, 118, 0.16);
        }
        .admin-login__btn {
          width: 100%;
          padding: 12px;
          margin-top: 2px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #04140c;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          background: linear-gradient(135deg, #33eb91 0%, #00e676 45%, #00c853 100%);
          box-shadow: 0 8px 24px rgba(0, 230, 118, 0.35);
          transition: box-shadow 0.25s, transform 0.2s, filter 0.2s;
        }
        .admin-login__btn:hover:not(:disabled) {
          box-shadow: 0 12px 34px rgba(0, 230, 118, 0.5);
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
        .admin-login__btn:active:not(:disabled) { transform: translateY(0); }
        .admin-login__btn:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
