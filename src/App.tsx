import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './lib/cart';
import { StoreProvider } from './lib/store';
import { Tip4ServAuthProvider } from './lib/tip4servAuth';
import { ThemeProvider } from './lib/theme';
import { ToastProvider } from './lib/toast';
import { LanguageProvider } from './lib/i18n';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ToastContainer from './components/ui/ToastContainer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCanceledPage from './pages/CheckoutCanceledPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
        <ToastProvider>
          <StoreProvider>
            <Tip4ServAuthProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                      <Route path="/checkout/canceled" element={<CheckoutCanceledPage />} />
                      <Route path="/account" element={<AccountPage />} />
                    </Routes>
                  </main>
                  <Footer />
                  <CartDrawer />
                  <ToastContainer />
                </div>
              </CartProvider>
            </Tip4ServAuthProvider>
          </StoreProvider>
        </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
