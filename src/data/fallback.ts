import type { Product, Category } from '../lib/types';

export const STORE_DOMAIN = 'arkshop';

export const fallbackCategories: Category[] = [
  {
    id: 1,
    name: 'Dinos & Créatures',
    description: 'Dinosaures apprivoisés et créatures prêtes au combat',
    slug: 'dinos',
    hide: false,
    main_redirect: false,
  },
  {
    id: 2,
    name: 'Ressources & Kits',
    description: 'Kits de démarrage et packs de ressources',
    slug: 'resources',
    hide: false,
    main_redirect: false,
  },
  {
    id: 3,
    name: 'VIP & Rangs',
    description: 'Rangs premium et privilèges exclusifs',
    slug: 'vip',
    hide: false,
    main_redirect: false,
  },
  {
    id: 4,
    name: 'Blueprints & Items',
    description: 'Blueprints rares et objets puissants',
    slug: 'blueprints',
    hide: false,
    main_redirect: false,
  },
];

const fallbackCategoryMap: Record<number, { id: number; name: string; slug: string }> = {
  1: { id: 1, name: 'Dinos & Créatures', slug: 'dinos' },
  2: { id: 2, name: 'Ressources & Kits', slug: 'resources' },
  3: { id: 3, name: 'VIP & Rangs', slug: 'vip' },
  4: { id: 4, name: 'Blueprints & Items', slug: 'blueprints' },
};

function makeCat(id: number): Product['category'] {
  const c = fallbackCategoryMap[id];
  return { id: c.id, name: c.name, slug: c.slug, hide: false, main_redirect: false };
}

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'Rex Alpha Tame',
    status: true,
    slug: 'rex-alpha-tame',
    price: 14.99,
    old_price: 19.99,
    percent_off: 25,
    small_description:
      'Un Rex Alpha entièrement apprivoisé avec des stats au niveau maximum. Prêt pour les boss fights et la domination en PvP.',
    category: makeCat(1),
    subscription: false,
    featured: true,
    image: 'https://images.pexels.com/photos/33536/hyla-meridionalis-european-tree-frog-amphibian-animal.jpg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
  {
    id: 2,
    name: 'Starter Kit Pro',
    status: true,
    slug: 'starter-kit-pro',
    price: 9.99,
    small_description:
      'Kit de démarrage complet avec outils en métal, armure Flak, flèches tranquillisantes et ressources essentielles.',
    category: makeCat(2),
    subscription: false,
    featured: true,
    image: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
  {
    id: 3,
    name: 'VIP Rang - Gold',
    status: true,
    slug: 'vip-gold',
    price: 19.99,
    old_price: 24.99,
    percent_off: 20,
    small_description:
      'Rang VIP Gold avec taux augmentés, file d\'attente prioritaire, couleur de chat personnalisée et commandes exclusives.',
    category: makeCat(3),
    subscription: true,
    duration_periodicity: 'month',
    period_num: 1,
    featured: true,
    image: 'https://images.pexels.com/photos/7862657/pexels-photo-7862657.jpeg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
  {
    id: 4,
    name: 'Giga Tame Pack',
    status: true,
    slug: 'giga-tame-pack',
    price: 24.99,
    small_description:
      'Giganotosaurus apprivoisé avec selle incluse. L\'une des créatures les plus puissantes d\'ARK.',
    category: makeCat(1),
    subscription: false,
    featured: false,
    image: 'https://images.pexels.com/photos/1115513/pexels-photo-1115513.jpeg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
  {
    id: 5,
    name: 'Pack Ressources x5000',
    status: true,
    slug: 'resource-bundle-5000',
    price: 7.49,
    small_description:
      'Pack de ressources en vrac : 5 000 lingots de métal, 5 000 polymère, 2 000 électroniques et 1 000 poussière d\'élément.',
    category: makeCat(2),
    subscription: false,
    featured: false,
    image: 'https://images.pexels.com/photos/4588065/pexels-photo-4588065.jpeg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
  {
    id: 6,
    name: 'VIP Rang - Diamond',
    status: true,
    slug: 'vip-diamond',
    price: 34.99,
    old_price: 44.99,
    percent_off: 22,
    small_description:
      'VIP Diamond : taux max, téléportation, dinos exclusifs, protection de base personnalisée et bien plus.',
    category: makeCat(3),
    subscription: true,
    duration_periodicity: 'month',
    period_num: 1,
    featured: true,
    image: 'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
  {
    id: 7,
    name: 'Ascendant BP Bundle',
    status: true,
    slug: 'ascendant-bp-bundle',
    price: 12.99,
    small_description:
      'Collection de blueprints Ascendant : Longneck, Pump Shotgun, Compound Bow et set Flak complet.',
    category: makeCat(4),
    subscription: false,
    featured: false,
    image: 'https://images.pexels.com/photos/7919/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
  {
    id: 8,
    name: 'Tek Armor Set',
    status: true,
    slug: 'tek-armor-set',
    price: 29.99,
    old_price: 39.99,
    percent_off: 25,
    small_description:
      'Set complet d\'armure Tek avec fusil Tek inclus. Comprend l\'élément nécessaire pour les alimenter pendant 30 jours de jeu.',
    category: makeCat(4),
    subscription: false,
    featured: true,
    image: 'https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg?auto=compress&cs=tinysrgb&w=600',
    created_date: Date.now(),
  },
];
