import { Gamepad2, ExternalLink, Hop as Home, Package, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { stripHtml } from '../../lib/utils';
import { useT } from '../../lib/i18n';

export default function Footer() {
  const { store } = useStore();
  const t = useT();
  const storeName = store?.title || 'ARK Shop';
  const storeDesc = stripHtml(store?.description || '') || t('footer.default_description');
  const menuLinks = store?.menu_links || [];

  return (
    <footer className="relative mt-24">
      <div className="divider-gradient" />
      <div className="absolute inset-0 bg-volcanic-950" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              {store?.logo ? (
                <img src={store.logo} alt={storeName} className="w-10 h-10 rounded-lg object-cover group-hover:shadow-lg group-hover:shadow-ark-500/20 transition-all duration-300" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ark-500 to-ark-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-ark-500/30 transition-all duration-300">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-lg font-bold text-heading group-hover:text-ark-400 transition-colors duration-300">{storeName}</span>
            </Link>
            <p className="text-sm text-volcanic-400 leading-relaxed max-w-xs">
              {storeDesc}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-heading uppercase tracking-wider mb-4">
              {t('footer.navigation')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-volcanic-400 hover:text-ark-400 hover:translate-x-1 transition-all duration-200"
                >
                  <Home className="w-3.5 h-3.5" />
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-sm text-volcanic-400 hover:text-ark-400 hover:translate-x-1 transition-all duration-200"
                >
                  <Package className="w-3.5 h-3.5" />
                  {t('footer.shop')}
                </Link>
              </li>
              {menuLinks.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-volcanic-400 hover:text-ark-400 hover:translate-x-1 transition-all duration-200"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    {item.title}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-heading uppercase tracking-wider mb-4">
              {t('footer.secure_payment')}
            </h3>
            <p className="text-sm text-volcanic-400 leading-relaxed mb-4">
              {t('footer.secure_payment_desc')}
            </p>
            <a
              href="https://tip4serv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-ark-400 hover:text-ark-300 transition-colors duration-200"
            >
              Tip4Serv
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-volcanic-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-volcanic-500">
            &copy; {new Date().getFullYear()} {storeName}. {t('footer.rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
