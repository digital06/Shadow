import { useState } from 'react';
import { X, Megaphone } from 'lucide-react';

interface Props {
  message: string;
  link?: string;
  variant?: 'info' | 'success' | 'warning';
}

const variants = {
  info: 'bg-gradient-to-r from-ark-600/90 to-cyan-600/90',
  success: 'bg-gradient-to-r from-emerald-600/90 to-green-600/90',
  warning: 'bg-gradient-to-r from-amber-600/90 to-orange-600/90',
};

export default function PromoBanner({ message, link, variant = 'info' }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const content = (
    <div className={`relative ${variants[variant]} text-white backdrop-blur-sm shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Megaphone className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label="Fermer la banniere"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block hover:opacity-90 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
