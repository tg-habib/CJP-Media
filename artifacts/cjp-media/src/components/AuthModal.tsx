import { useState } from 'react';
import { Flame, X, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, sendPasswordReset } from '../firebase';

type View = 'signin' | 'signup' | 'forgot';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultView?: View;
  onSignupSuccess?: () => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function InputField({
  label, type = 'text', value, onChange, placeholder, error, showToggle, onToggle,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  showToggle?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/60 text-[12px] font-medium tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 outline-none focus:border-[#ccff00]/40 focus:bg-white/[0.06] transition-all ${
            error ? 'border-red-500/50' : 'border-white/[0.08]'
          } ${showToggle ? 'pr-11' : ''}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-0.5"
          >
            {type === 'password' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-[11px] font-medium">{error}</p>}
    </div>
  );
}

export default function AuthModal({ open, onClose, defaultView = 'signin', onSignupSuccess }: AuthModalProps) {
  const [view, setView] = useState<View>(defaultView);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setError(''); setSuccess('');
    setFieldErrors({});
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setShowPassword(false); setShowConfirm(false);
  };

  const switchView = (v: View) => { reset(); setView(v); };

  const handleClose = () => { reset(); setView('signin'); onClose(); };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('');
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) { handleClose(); return; }
    if (res.error) setError(res.error);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required.';
    if (!password) errs.password = 'Password is required.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true); setError(''); setFieldErrors({});
    const res = await loginWithEmail(email.trim(), password);
    setLoading(false);
    if (res.success) { handleClose(); return; }
    if (res.error) setError(res.error);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'At least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true); setError(''); setFieldErrors({});
    const res = await registerWithEmail(name.trim(), email.trim(), password);
    setLoading(false);
    if (res.success) {
      handleClose();
      onSignupSuccess?.();
      return;
    }
    if (res.error) setError(res.error);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true); setError(''); setSuccess(''); setFieldErrors({});
    const res = await sendPasswordReset(email.trim());
    setLoading(false);
    if (res.success) {
      setSuccess('Reset link sent. Check your inbox (and spam folder).');
      return;
    }
    if (res.error) setError(res.error);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      {/* Panel */}
      <div className="relative w-full max-w-[420px] bg-[#0e0e0e] border border-white/[0.08] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/15 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#ccff00]" strokeWidth={2} />
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight">CJP Media</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-6 pb-7">
          {/* Heading */}
          {view === 'signin' && (
            <div className="mb-6">
              <h2 className="text-white font-black text-[22px] tracking-tight mb-1">Welcome back</h2>
              <p className="text-white/35 text-[13px]">Sign in to your account to continue.</p>
            </div>
          )}
          {view === 'signup' && (
            <div className="mb-6">
              <h2 className="text-white font-black text-[22px] tracking-tight mb-1">Create account</h2>
              <p className="text-white/35 text-[13px]">Join the movement. It's free forever.</p>
            </div>
          )}
          {view === 'forgot' && (
            <div className="mb-6">
              <button
                onClick={() => switchView('signin')}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-[12px] font-medium transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </button>
              <h2 className="text-white font-black text-[22px] tracking-tight mb-1">Reset password</h2>
              <p className="text-white/35 text-[13px]">We'll send a reset link to your email.</p>
            </div>
          )}

          {/* Global error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/8 border border-red-500/15 rounded-xl">
              <p className="text-red-400 text-[12px] font-medium">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 px-4 py-3 bg-[#ccff00]/8 border border-[#ccff00]/15 rounded-xl">
              <p className="text-[#ccff00] text-[12px] font-medium">{success}</p>
            </div>
          )}

          {/* Sign In Form */}
          {view === 'signin' && (
            <>
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white text-black font-semibold text-[14px] rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 mb-4"
              >
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-white/25 text-[11px] font-medium">or</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                <InputField
                  label="Email" type="email" value={email}
                  onChange={setEmail} placeholder="you@example.com"
                  error={fieldErrors.email}
                />
                <InputField
                  label="Password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={setPassword} placeholder="••••••••"
                  error={fieldErrors.password}
                  showToggle onToggle={() => setShowPassword(p => !p)}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchView('forgot')}
                    className="text-white/35 hover:text-[#ccff00] text-[12px] font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#ccff00] text-black font-bold text-[14px] rounded-xl hover:bg-white transition-all disabled:opacity-60 mt-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-white/30 text-[12px] mt-5">
                Don't have an account?{' '}
                <button onClick={() => switchView('signup')} className="text-[#ccff00] hover:underline font-medium">
                  Sign up
                </button>
              </p>
            </>
          )}

          {/* Sign Up Form */}
          {view === 'signup' && (
            <>
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white text-black font-semibold text-[14px] rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 mb-4"
              >
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-white/25 text-[11px] font-medium">or create with email</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                <InputField
                  label="Full Name" value={name}
                  onChange={setName} placeholder="Your name"
                  error={fieldErrors.name}
                />
                <InputField
                  label="Email" type="email" value={email}
                  onChange={setEmail} placeholder="you@example.com"
                  error={fieldErrors.email}
                />
                <InputField
                  label="Password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={setPassword} placeholder="At least 6 characters"
                  error={fieldErrors.password}
                  showToggle onToggle={() => setShowPassword(p => !p)}
                />
                <InputField
                  label="Confirm Password" type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                  onChange={setConfirmPassword} placeholder="Repeat password"
                  error={fieldErrors.confirmPassword}
                  showToggle onToggle={() => setShowConfirm(p => !p)}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#ccff00] text-black font-bold text-[14px] rounded-xl hover:bg-white transition-all disabled:opacity-60 mt-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-white/30 text-[12px] mt-5">
                Already have an account?{' '}
                <button onClick={() => switchView('signin')} className="text-[#ccff00] hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* Forgot Password Form */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="flex flex-col gap-3">
              <InputField
                label="Email" type="email" value={email}
                onChange={setEmail} placeholder="you@example.com"
                error={fieldErrors.email}
              />
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#ccff00] text-black font-bold text-[14px] rounded-xl hover:bg-white transition-all disabled:opacity-60 mt-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {view !== 'forgot' && (
            <p className="text-center text-white/15 text-[11px] mt-5">
              Free forever. No spam. Just satire.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
