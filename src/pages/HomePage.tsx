import { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import FeaturedProducts from '../components/home/FeaturedProducts';
import LatestProducts from '../components/home/LatestProducts';
import CategorySection from '../components/home/CategorySection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getAllProducts, getCategories } from '../lib/api';
import { fallbackProducts, fallbackCategories } from '../data/fallback';
import type { Product, Category } from '../lib/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, catRes] = await Promise.all([
          getAllProducts(),
          getCategories(),
        ]);
        if (products.length > 0) setProducts(products);
        if (catRes.categories?.length > 0) setCategories(catRes.categories);
      } catch {
        // fallback data already set
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
