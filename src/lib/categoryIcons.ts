import {
  Skull,
  Package,
  Crown,
  ScrollText,
  Sword,
  Shield,
  Gem,
  Flame,
  Star,
  Boxes,
  Coins,
  Map,
  Rocket,
  Heart,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const KEYWORD_ICON_MAP: [string[], LucideIcon][] = [
  [['dino', 'creature', 'créature', 'animal', 'tame', 'pet'], Skull],
  [['resource', 'ressource', 'kit', 'pack', 'bundle', 'starter'], Boxes],
  [['vip', 'rang', 'rank', 'premium', 'gold', 'diamond', 'platine'], Crown],
  [['blueprint', 'bp', 'plan', 'schéma'], ScrollText],
  [['weapon', 'arme', 'sword', 'gun', 'fusil'], Sword],
  [['armor', 'armure', 'armour', 'protection', 'shield', 'bouclier'], Shield],
  [['gem', 'gemme', 'element', 'élément', 'crystal', 'cristal'], Gem],
  [['fire', 'feu', 'flame', 'flamme', 'boost'], Flame],
  [['coin', 'money', 'monnaie', 'currency', 'credit', 'token'], Coins],
  [['map', 'carte', 'world', 'monde', 'transfer', 'serveur'], Map],
  [['rocket', 'tek', 'tech', 'advanced', 'avancé'], Rocket],
  [['health', 'santé', 'heal', 'soin', 'potion'], Heart],
  [['power', 'puissance', 'buff', 'boost', 'xp', 'experience'], Zap],
  [['special', 'spécial', 'exclusive', 'exclusif', 'rare', 'legendary'], Star],
  [['item', 'objet', 'tool', 'outil', 'misc', 'divers'], Package],
];

export function getCategoryIcon(nameOrSlug: string): LucideIcon {
  const lower = nameOrSlug.toLowerCase();
  for (const [keywords, icon] of KEYWORD_ICON_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return icon;
    }
  }
  return Package;
}
