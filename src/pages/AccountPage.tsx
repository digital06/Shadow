import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Repeat,
  User as UserIcon,
  Loader as Loader2,
  CircleAlert as AlertCircle,
  ExternalLink,
  CircleCheck as CheckCircle2,
  CircleX as XCircle,
  Clock,
  LogOut,
  Mail,
  CalendarDays,
  Ban,
} from 'lucide-react';
import {
  useTip4ServAuth,
  fetchUserPayments,
  fetchUserSubscriptions,
  unsubscribeUserSubscription,
  type Tip4ServPayment,
  type Tip4ServSubscription,
} from '../lib/tip4servAuth';
import { useToast } from '../lib/toast';

type TabKey = 'profile' | 'payments' | 'subscriptions';

function formatDate(ts: number): string {
  if (!ts) return '—';
  const ms = ts > 1e12 ? ts : ts * 1000;
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatAmount(amount: number, currency: string): string {
  const safeCurrency = (currency || 'EUR').toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: safeCurrency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${safeCurrency}`;
  }
}

function StatusPill({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const isPaid = s === 'paid';
  const isProcessed = ['processed', 'complete', 'completed', 'succeeded', 'success', 'active'].includes(s);
  const isPending = ['pending', 'processing', 'created', 'open'].includes(s);
  const cls = isPaid
    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
    : isProcessed
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : isPending
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  const Icon = isPaid || isProcessed ? CheckCircle2 : isPending ? Clock : XCircle;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
      <Icon className="w-3 h-3" />
      {status || 'unknown'}
    </span>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user, ready, loading, connect, logout } = useTip4ServAuth();
  const { addToast } = useToast();
  const initialTab = ((): TabKey => {
    const t = searchParams.get('tab');
    return t === 'payments' || t === 'subscriptions' ? t : 'profile';
  })();
  const [tab, setTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const current = searchParams.get('tab');
    const desired = tab === 'profile' ? null : tab;
    if (current === desired) return;
    const next = new URLSearchParams(searchParams);
    if (desired) next.set('tab', desired);
    else next.delete('tab');
    setSearchParams(next, { replace: true });
  }, [tab, searchParams, setSearchParams]);
  const [payments, setPayments] = useState<Tip4ServPayment[] | null>(null);
  const [paymentsErr, setPaymentsErr] = useState<string | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [subs, setSubs] = useState<Tip4ServSubscription[] | null>(null);
  const [subsErr, setSubsErr] = useState<string | null>(null);
  const [subsLoading, setSubsLoading] = useState(false);
  const [unsubBusy, setUnsubBusy] = useState<number | null>(null);

  useEffect(() => {
    if (!token || tab !== 'payments' || payments !== null) return;
    setPaymentsLoading(true);
    setPaymentsErr(null);
    fetchUserPayments(token)
      .then((r) => setPayments(r.payments || []))
      .catch((e: Error) => setPaymentsErr(e.message))
      .finally(() => setPaymentsLoading(false));
  }, [token, tab, payments]);

  useEffect(() => {
    if (!token || tab !== 'subscriptions' || subs !== null) return;
    setSubsLoading(true);
    setSubsErr(null);
    fetchUserSubscriptions(token)
      .then((r) => setSubs(r.subscriptions || []))
      .catch((e: Error) => setSubsErr(e.message))
      .finally(() => setSubsLoading(false));
  }, [token, tab, subs]);

  const handleUnsubscribe = useCallback(
    async (subscriptionId: number) => {
      if (!token) return;
      const ok = window.confirm('Confirmer la résiliation de cet abonnement ?');
      if (!ok) return;
      setUnsubBusy(subscriptionId);
      try {
        await unsubscribeUserSubscription(token, subscriptionId);
        addToast('Abonnement résilié.', 'success');
        setSubs((prev) =>
          prev
            ? prev.map((s) => (s.id === subscriptionId ? { ...s, unsubscribed: true } : s))
            : prev
        );
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Erreur lors de la résiliation', 'error');
      } finally {
        setUnsubBusy(null);
      }
    },
    [token, addToast]
  );

  if (!ready || loading) {
    return (
      <div className="pt-32 pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 text-ark-500 animate-spin mx-auto mb-4" />
          <p className="text-volcanic-400">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="pt-32 pb-16 animate-fade-in">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-ark-600/15 flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-10 h-10 text-ark-500" />
          </div>
          <h1 className="text-2xl font-bold text-heading mb-3">Accédez à votre espace</h1>
          <p className="text-volcanic-400 mb-8">
            Connectez-vous via Tip4Serv pour consulter vos paiements et gérer vos abonnements.
          </p>
          <button onClick={connect} className="btn-primary px-8 py-3">
            <UserIcon className="w-5 h-5" />
            Se connecter avec Tip4Serv
          </button>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-2 text-sm text-volcanic-400 hover:text-heading transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: typeof UserIcon }[] = [
    { key: 'profile', label: 'Profil', icon: UserIcon },
    { key: 'payments', label: 'Paiements', icon: CreditCard },
    { key: 'subscriptions', label: 'Abonnements', icon: Repeat },
  ];

  return (
    <div className="pt-24 lg:pt-28 pb-16 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-volcanic-400 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-heading transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
          <span>/</span>
          <span className="text-volcanic-500">Mon compte</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-volcanic-800/60 border border-volcanic-700/40 overflow-hidden flex items-center justify-center shrink-0">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.username || ''} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-7 h-7 text-volcanic-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-heading">
                {user?.username || 'Mon compte'}
              </h1>
              {user?.email && (
                <p className="text-sm text-volcanic-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-volcanic-300 hover:text-rose-300 hover:bg-rose-500/10 border border-volcanic-800/50 hover:border-rose-500/30 transition-all duration-200 self-start md:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-thin -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map((tt) => {
            const active = tab === tt.key;
            const Icon = tt.icon;
            return (
              <button
                key={tt.key}
                onClick={() => setTab(tt.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-ark-600 text-white shadow-lg shadow-ark-600/20'
                    : 'bg-volcanic-800/40 text-volcanic-300 hover:text-heading hover:bg-volcanic-800/70 border border-volcanic-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tt.label}
              </button>
            );
          })}
        </div>

        {tab === 'profile' && (
          <div className="glass-card p-6 lg:p-8 max-w-2xl">
            <h2 className="text-lg font-semibold text-heading mb-6">Informations du profil</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <dt className="text-xs uppercase tracking-wider text-volcanic-500 font-semibold mb-1">Identifiant</dt>
                <dd className="text-heading font-medium">{user?.id ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-volcanic-500 font-semibold mb-1">Pseudo</dt>
                <dd className="text-heading font-medium">{user?.username || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-volcanic-500 font-semibold mb-1">E-mail</dt>
                <dd className="text-heading font-medium break-all">{user?.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-volcanic-500 font-semibold mb-1">Langue</dt>
                <dd className="text-heading font-medium">{user?.language || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-volcanic-500 font-semibold mb-1">Fuseau horaire</dt>
                <dd className="text-heading font-medium">{user?.timezone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-volcanic-500 font-semibold mb-1">Inscrit le</dt>
                <dd className="text-heading font-medium flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-volcanic-500" />
                  {user?.registration_date ? formatDate(user.registration_date) : '—'}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {tab === 'payments' && (
          <PaymentsPanel
            loading={paymentsLoading}
            error={paymentsErr}
            payments={payments}
          />
        )}

        {tab === 'subscriptions' && (
          <SubscriptionsPanel
            loading={subsLoading}
            error={subsErr}
            subs={subs}
            unsubBusy={unsubBusy}
            onUnsubscribe={handleUnsubscribe}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof UserIcon; title: string; description: string }) {
  return (
    <div className="glass-card p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-volcanic-800/60 flex items-center justify-center mx-auto mb-5">
        <Icon className="w-8 h-8 text-volcanic-500" />
      </div>
      <h3 className="text-lg font-semibold text-heading mb-1.5">{title}</h3>
      <p className="text-volcanic-400 text-sm max-w-md mx-auto">{description}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass-card p-6 border border-rose-500/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-rose-300 font-semibold mb-1">Impossible de charger</p>
          <p className="text-volcanic-400 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="glass-card p-10 text-center">
      <Loader2 className="w-7 h-7 text-ark-500 animate-spin mx-auto mb-3" />
      <p className="text-volcanic-400 text-sm">{label}</p>
    </div>
  );
}

function PaymentsPanel({
  loading,
  error,
  payments,
}: {
  loading: boolean;
  error: string | null;
  payments: Tip4ServPayment[] | null;
}) {
  if (loading) return <LoadingPanel label="Chargement de l'historique..." />;
  if (error) return <ErrorState message={error} />;
  if (!payments || payments.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Aucun paiement"
        description="Vos achats apparaîtront ici dès votre première commande."
      />
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <article key={p.id} className="glass-card p-5 hover:border-ark-600/30 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs text-volcanic-500 font-mono">#{p.id}</span>
                <StatusPill status={p.status} />
                {p.gateway && (
                  <span className="text-[11px] uppercase tracking-wider text-volcanic-500 font-semibold">
                    {p.gateway}
                  </span>
                )}
              </div>
              <h3 className="text-heading font-semibold truncate">{p.cart || 'Commande'}</h3>
              <div className="text-xs text-volcanic-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(p.date)}
                </span>
                {p.identifier && <span className="truncate">Livré à : {p.identifier}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xl font-bold text-heading">
                  {formatAmount(p.amount, p.currency)}
                </div>
              </div>
              {p.details_page && (
                <a
                  href={p.details_page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-volcanic-300 hover:text-heading bg-volcanic-800/40 hover:bg-volcanic-800/70 border border-volcanic-800/50 transition-colors"
                >
                  Détails
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function SubscriptionsPanel({
  loading,
  error,
  subs,
  unsubBusy,
  onUnsubscribe,
}: {
  loading: boolean;
  error: string | null;
  subs: Tip4ServSubscription[] | null;
  unsubBusy: number | null;
  onUnsubscribe: (id: number) => void;
}) {
  if (loading) return <LoadingPanel label="Chargement des abonnements..." />;
  if (error) return <ErrorState message={error} />;
  if (!subs || subs.length === 0) {
    return (
      <EmptyState
        icon={Repeat}
        title="Aucun abonnement"
        description="Vos abonnements actifs apparaîtront ici."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subs.map((s) => {
        const periodLabel = s.period_num && s.duration_periodicity
          ? `${s.period_num} ${s.duration_periodicity}`
          : s.duration_periodicity || '';
        const canCancel = !s.unsubscribed && !s.onetime && (s.status || '').toLowerCase() === 'active';
        return (
          <article key={s.id} className="glass-card p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <span className="text-xs text-volcanic-500 font-mono">#{s.id}</span>
                <h3 className="text-heading font-semibold truncate mt-0.5">{s.name}</h3>
              </div>
              <StatusPill status={s.unsubscribed ? 'unsubscribed' : s.status} />
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-volcanic-500 font-semibold">Prix</dt>
                <dd className="text-heading font-semibold">{formatAmount(s.price, s.currency)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-volcanic-500 font-semibold">Cycle</dt>
                <dd className="text-heading font-medium">{s.onetime ? 'Unique' : periodLabel || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-volcanic-500 font-semibold">Début</dt>
                <dd className="text-heading font-medium">{formatDate(s.start_date)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-volcanic-500 font-semibold">
                  {s.unsubscribed ? 'Expire le' : 'Prochain paiement'}
                </dt>
                <dd className="text-heading font-medium">
                  {formatDate(s.unsubscribed ? s.expire_date : s.next_payment)}
                </dd>
              </div>
            </dl>

            {canCancel && (
              <div className="mt-auto pt-2 border-t border-volcanic-800/40">
                <button
                  onClick={() => onUnsubscribe(s.id)}
                  disabled={unsubBusy === s.id}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unsubBusy === s.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Ban className="w-3.5 h-3.5" />
                  )}
                  Se désabonner
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
