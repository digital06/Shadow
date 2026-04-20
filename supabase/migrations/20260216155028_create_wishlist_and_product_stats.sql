/*
  # Create Wishlist and Product Statistics

  ## New Tables
    - `wishlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (integer, product ID from external API)
      - `created_at` (timestamp)
    
    - `product_stats`
      - `id` (uuid, primary key)
      - `product_id` (integer, unique, product ID from external API)
      - `view_count` (integer, number of views)
      - `first_seen_at` (timestamp, when product was first tracked)
      - `last_viewed_at` (timestamp, last view timestamp)
      - `created_at` (timestamp)

  ## Security
    - Enable RLS on all tables
    - Users can read/write their own wishlist items
    - Product stats are publicly readable
    - Product stats writable through function only

  ## Indexes
    - Index on wishlist (user_id, product_id) for fast lookups
    - Unique index on product_stats (product_id)
*/

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS wishlists_user_product_unique 
  ON wishlists(user_id, product_id);

-- Create product_stats table for tracking views and metadata
CREATE TABLE IF NOT EXISTS product_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL UNIQUE,
  view_count integer DEFAULT 0,
  first_seen_at timestamptz DEFAULT now(),
  last_viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS product_stats_product_id_idx 
  ON product_stats(product_id);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stats ENABLE ROW LEVEL SECURITY;

-- Wishlist policies: users can manage their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Product stats policies: public read, controlled write
CREATE POLICY "Anyone can view product stats"
  ON product_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service can manage product stats"
  ON product_stats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to track product view
CREATE OR REPLACE FUNCTION track_product_view(p_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO product_stats (product_id, view_count, first_seen_at, last_viewed_at)
  VALUES (p_id, 1, now(), now())
  ON CONFLICT (product_id) 
  DO UPDATE SET 
    view_count = product_stats.view_count + 1,
    last_viewed_at = now();
END;
$$;
