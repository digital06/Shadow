import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ArrowUpDown, LayoutGrid, Rows3 } from 'lucide-react';
import ProductGrid from '../components/products/ProductGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getAllProducts, getCategories } from '../lib/api';
import { fallbackProducts, fallbackCategories } from '../data/fallback';
import { getCategoryIcon } from '../lib/categoryIcons';
import type { Product, Category } from '../lib/types';
import { useT } from '../lib/i18n';

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'newest' | 'popular';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('category');
  const t = useT();

  const [allProducts, setAllProducts] = useState<Product[]>(fallbackProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  useEffect(() => {
    async function loadCategories() {
      try {
        const catRes = await getCategories();
        if (catRes.categories?.length > 0) setCategories(catRes.categories);
      } catch {
        // fallback
      }
    }
    loadCategories();
  }, []);

  const categoryIdBySlug = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach((c) => map.set(c.slug, c.id));
    return map;
  }, [categories]);

  const activeCategoryId = activeSlug ? categoryIdBySlug.get(activeSlug) : undefined;

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      setLoading(true);
      try {
        const products = await getAllProducts(activeCategoryId);
        if (!cancelled && products.length > 0) {
          if (activeCategoryId === undefined) setAllProducts(products);
          setFilteredProducts(products);
        } else if (!cancelled) {
          if (activeCategoryId === undefined) {
            setFilteredProducts(fallbackProducts);
          } else {
            setFilteredProducts([]);
          }
        }
      } catch {
        if (!cancelled) {
          if (activeCategoryId === undefined) {
            setFilteredProducts(fallbackProducts);
          } else {
            const catId = activeCategoryId;
            setFilteredProducts(allProducts.filter((p) => p.category?.id === catId));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, [activeCategoryId]);

  const activeCategory = activeSlug
    ? categories.find((c) => c.slug === activeSlug)
    : null;
  const activeCategoryName = activeCategory?.name || null;

  const { filtered, totalPages, paginatedProducts } = useMemo(() => {
    const results = filteredProducts.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          (p.small_description || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      return true;
    });

    const sorted = results.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return b.id - a.id;
        case 'popular':
          return (b.id > 9000 ? 1 : 0) - (a.id > 9000 ? 1 : 0);
        default:
          return 0;
      }
    });

    const total = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

    return { filtered: sorted, totalPages: total, paginatedProducts: paginated };
  }, [filteredProducts, search, sortBy, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, activeSlug, itemsPerPage]);

  const productGridRef = useRef<HTMLDivElement>(null);

  const setCategory = useCallback(
    (slug: string | null) => {
      if (slug) {
        setSearchParams({ category: slug });
      } else {
        setSearchParams({});
      }
      if (window.innerWidth < 1024 && productGridRef.current) {
        setTimeout(() => {
          productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    },
    [setSearchParams]
  );

  return (
    <div className="pt-24 lg:pt-28 pb-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-heading mb-3">
            {activeCategoryName || t('products.page.title_all')}
          </h1>
          <p className="text-volcanic-400 text-lg">
            {activeCategoryName
              ? t('products.page.subtitle_category', { name: activeCategoryName })
              : t('products.page.subtitle_all')}
          </p>
          {(activeSlug || search) && (
            <p className="text-ark-400 font-medium mt-2">
              {filtered.length} {filtered.length !== 1 ? t('products.page.found_plural') : t('products.page.found_singular')}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-volcanic-900/60 border border-volcanic-800/50 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  {t('products.page.sidebar_categories')}
                </h2>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategory(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !activeSlug
                        ? 'bg-ark-600 text-white shadow-lg shadow-ark-600/20'
                        : 'text-volcanic-300 hover:text-heading hover:bg-volcanic-800/60'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                    <span>{t('products.page.title_all')}</span>
                  </button>
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.slug || cat.name);
                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setCategory(activeSlug === cat.slug ? null : cat.slug)
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeSlug === cat.slug
                            ? 'bg-ark-600 text-white shadow-lg shadow-ark-600/20'
                            : 'text-volcanic-300 hover:text-heading hover:bg-volcanic-800/60'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          <div ref={productGridRef} className="flex-1 min-w-0 scroll-mt-24">
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    placeholder={t('products.page.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-11"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-volcanic-500 group-focus-within:text-ark-500 transition-colors" />
                </div>

                <div className="relative sm:w-56">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="input-field pl-11 appearance-none cursor-pointer"
                  >
                    <option value="name">{t('products.sort.name')}</option>
                    <option value="newest">{t('products.sort.newest')}</option>
                    <option value="popular">{t('products.sort.popular')}</option>
                    <option value="price-asc">{t('products.sort.price_asc')}</option>
                    <option value="price-desc">{t('products.sort.price_desc')}</option>
                  </select>
                  <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-volcanic-500 pointer-events-none" />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-volcanic-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative sm:w-44">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="input-field pl-11 appearance-none cursor-pointer"
                  >
                    <option value={12}>{t('products.per_page', { n: 12 })}</option>
                    <option value={24}>{t('products.per_page', { n: 24 })}</option>
                    <option value={48}>{t('products.per_page', { n: 48 })}</option>
                    <option value={96}>{t('products.per_page', { n: 96 })}</option>
                  </select>
                  <Rows3 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-volcanic-500 pointer-events-none" />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-volcanic-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {activeSlug && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeSlug && (
                    <button
                      onClick={() => setCategory(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-volcanic-300 bg-volcanic-800/50 rounded-lg hover:bg-volcanic-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      {activeCategoryName}
                    </button>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <ProductGrid products={paginatedProducts} />

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-volcanic-800/60 text-volcanic-300 hover:bg-volcanic-800 hover:text-heading disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {t('products.pagination.prev')}
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? 'bg-ark-600 text-white shadow-lg shadow-ark-600/20'
                                  : 'bg-volcanic-800/60 text-volcanic-300 hover:bg-volcanic-800 hover:text-heading'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="text-volcanic-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-volcanic-800/60 text-volcanic-300 hover:bg-volcanic-800 hover:text-heading disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {t('products.pagination.next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
