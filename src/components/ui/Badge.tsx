interface BadgeProps {
  children: React.ReactNode;
  variant?: 'discount' | 'subscription' | 'featured' | 'stock' | 'new';
}

const variants = {
  discount: 'bg-red-500/90 text-white shadow-lg shadow-red-500/20',
  subscription: 'bg-ark-600/90 text-white shadow-lg shadow-ark-600/20',
  featured: 'bg-sand-500/90 text-volcanic-950 shadow-lg shadow-sand-500/20',
  stock: 'bg-volcanic-700/90 text-volcanic-200',
  new: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30',
};

export default function Badge({ children, variant = 'discount' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
