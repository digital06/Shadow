import { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import LatestProducts from '../components/home/LatestProducts';
import CategorySection from '../components/home/CategorySection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getAllProducts, getCategories } from '../lib/api';
import type { Product, Category } from '../lib/types';
import { usePageTitle } from '../lib/usePageTitle';

export default function HomePage() {
  usePageTitle();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, catRes] = await Promise.all([
          getAllProducts(),
          getCategories(),
        ]);
        setProducts(products);
        setCategories(catRes.categories ?? []);
      } catch {
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-volcanic-950">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Hero />
      <LatestProducts products={products} />
      <FeaturedProducts products={products} />
      <CategorySection categories={categories} />
    </div>
  );
}
