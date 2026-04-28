import { useEffect, useRef, useState } from 'react';
import { Loader as Loader2, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '../lib/usePageTitle';

const ORIGIN_KEY = 'discord_oauth_opener_origin';

export default function DiscordOAuthCallbackPage() {
  usePageTitle('Discord');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('');
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error_description') || params.get('error');

    let targetOrigin = window.location.origin;
    try {
      const stored = window.sessionStorage.getItem(ORIGIN_KEY);
      if (stored) targetOrigin = stored;
    } catch {
      // ignore
    }

    if (error) {
      setStatus('error');
      setMessage(error);
      try {
        window.opener?.postMessage({ type: 'discord-oauth', ok: false, error }, targetOrigin);
      } catch {
        // ignore
      }
      setTimeout(() => window.close(), 800);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Code OAuth manquant.');
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/discord/callback`;

    if (!supabaseUrl || !supabaseAnon || !clientId) {
      const msg = 'Discord OAuth is not configured.';
      setStatus('error');
      setMessage(msg);
      try {
        window.opener?.postMessage({ type: 'discord-oauth', ok: false, error: msg }, targetOrigin);
      } catch {
        // ignore
      }
      return;
    }

    fetch(`${supabaseUrl}/functions/v1/discord-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnon}`,
      },
      body: JSON.stringify({ code, redirect_uri: redirectUri, client_id: clientId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.id) {
          const msg = data?.error || `Erreur Discord (${res.status}).`;
          throw new Error(msg);
        }
        setStatus('success');
        setMessage(data.username || data.id);
        try {
          window.opener?.postMessage(
            {
              type: 'discord-oauth',
              ok: true,
              id: data.id as string,
              username: (data.username as string) || '',
              global_name: (data.global_name as string) || '',
            },
            targetOrigin,
          );
        } catch {
          // ignore
        }
        setTimeout(() => window.close(), 600);
      })
      .catch((err: Error) => {
        setStatus('error');
        setMessage(err.message);
        try {
          window.opener?.postMessage({ type: 'discord-oauth', ok: false, error: err.message }, targetOrigin);
        } catch {
          // ignore
        }
        setTimeout(() => window.close(), 1500);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card max-w-md w-full p-8 text-center">
        {status === 'pending' && (
          <>
            <Loader2 className="w-10 h-10 text-ark-500 animate-spin mx-auto mb-4" />
            <h1 className="text-lg font-bold text-heading mb-2">Connexion à Discord...</h1>
            <p className="text-sm text-volcanic-400">Récupération de votre identifiant en cours.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-heading mb-2">Identifiant récupéré</h1>
            <p className="text-sm text-volcanic-400">Bienvenue {message}. Vous pouvez fermer cette fenêtre.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-heading mb-2">Connexion impossible</h1>
            <p className="text-sm text-volcanic-400 break-all">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
