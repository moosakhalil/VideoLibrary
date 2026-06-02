import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { customer, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (customer) navigate('/', { replace: true });

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setPin('');
    setPinConfirm('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) return setError('Please enter your phone number.');
    if (!pin) return setError('Please enter your PIN.');
    if (mode === 'signup' && pin !== pinConfirm) return setError('PINs do not match.');

    setBusy(true);
    try {
      if (mode === 'login') await login(phone, pin);
      else await register(phone, pin, pinConfirm);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-3xl">
            🏆
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Rewards & Knowledge</h1>
          <p className="text-slate-500">Earn rewards. Learn from videos.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'login' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'signup' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'
            }`}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            className="input"
            type="tel"
            inputMode="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
          />
          <input
            className="input text-center tracking-[0.4em]"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder={mode === 'signup' ? 'Choose a PIN (4–6 digits)' : 'PIN'}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />
          {mode === 'signup' && (
            <input
              className="input text-center tracking-[0.4em]"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Confirm PIN"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
            />
          )}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account & go'}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-center text-sm">
          {mode === 'login' ? (
            <>
              <p className="text-slate-500">
                New here?{' '}
                <button onClick={() => switchMode('signup')} className="font-semibold text-brand-600">
                  Create an account
                </button>
              </p>
              <p className="text-xs text-slate-400">Forgot PIN? Please contact us to reset it.</p>
            </>
          ) : (
            <p className="text-slate-500">
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="font-semibold text-brand-600">
                Log in
              </button>
            </p>
          )}
          <p className="pt-2">
            <Link to="/admin/login" className="text-xs text-slate-400 hover:text-slate-600">
              Admin panel →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
