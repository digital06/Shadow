import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, ShieldCheck, Loader as Loader2, LogOut, Save, Lock } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { usePageTitle } from '../lib/usePageTitle';

type Status = 'loading' | 'claim' | 'login' | 'owner' | 'denied';

export default function AdminPage() {
  usePageTitle('Administration');

  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [initialKey, setInitialKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function resolveStatus(currentSession: Session | null) {
    const { data: ownerExists, error: err } = await supabase.rpc('has_owner');
    if (err) {
      setError(err.message);
      setStatus('login');
      return;
    }

    if (!ownerExists) {
      setStatus('claim');
      return;
    }

    if (!currentSession) {
      setStatus('login');
      return;
    }

    const { data: isOwner } = await supabase.rpc('is_owner');
    if (!isOwner) {
      setStatus('denied');
      return;
    }

    const { data: keyRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'tip4serv_api_key')
      .maybeSingle();

    const val = keyRow?.value || '';
    setApiKey(val);
    setInitialKey(val);
    setStatus('owner');
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      resolveStatus(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      (async () => {
        await resolveStatus(newSession);
      })();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClaim(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpErr && !/already|registered/i.test(signUpErr.message)) {
        throw signUpErr;
      }

      let userId = signUpData?.user?.id ?? null;
      if (!userId) {
        const { data: signInData, error: signInErr } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        userId = signInData.user?.id ?? null;
      }
      if (!userId) throw new Error('Authentication failed');

      const { error: claimErr } = await supabase
        .from('app_owner')
        .insert({ id: 1, user_id: userId });
      if (claimErr) throw claimErr;

      setPassword('');
      setInfo('Ownership claimed. You can now configure the Tip4Serv key.');
      await resolveStatus(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) throw signInErr;
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error: upsertErr } = await supabase
        .from('app_settings')
        .upsert(
          { key: 'tip4serv_api_key', value: apiKey.trim(), updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (upsertErr) throw upsertErr;
      setInitialKey(apiKey.trim());
      setInfo('Tip4Serv API key saved. It takes effect immediately.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-[70vh] flex items-start justify-center px-4 py-16 bg-[var(--color-bg)]">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              Administration
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Configure your Tip4Serv API key.
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          {status === 'loading' && (
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          )}

          {status === 'denied' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[var(--color-text)]">Access denied</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    This account is not the owner of this site.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--color-border)] rounded-lg text-sm font-medium hover:bg-[var(--color-bg)] transition"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}

          {status === 'claim' && (
            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <h2 className="font-medium text-[var(--color-text)]">
                  Claim this site
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  No owner yet. Create the owner account now — this is a
                  one-time action.
                </p>
              </div>
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
              />
              <SubmitButton busy={busy} icon={<ShieldCheck className="w-4 h-4" />}>
                Claim ownership
              </SubmitButton>
            </form>
          )}

          {status === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="font-medium text-[var(--color-text)]">Sign in</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Owner access is required to manage settings.
                </p>
              </div>
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                required
              />
              <SubmitButton busy={busy} icon={<KeyRound className="w-4 h-4" />}>
                Sign in
              </SubmitButton>
            </form>
          )}

          {status === 'owner' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium text-[var(--color-text)]">
                    Tip4Serv API key
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Stored server-side. Never exposed to visitors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] inline-flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
              <Field
                label="API key"
                type="password"
                value={apiKey}
                onChange={setApiKey}
                placeholder="Paste your Tip4Serv key"
              />
              <SubmitButton
                busy={busy}
                disabled={apiKey.trim() === initialKey.trim()}
                icon={<Save className="w-4 h-4" />}
              >
                Save key
              </SubmitButton>
            </form>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              {info}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  minLength,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
      />
    </label>
  );
}

function SubmitButton({
  busy,
  disabled,
  icon,
  children,
}: {
  busy: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
