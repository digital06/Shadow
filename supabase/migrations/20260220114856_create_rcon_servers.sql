/*
  # Create RCON servers configuration table

  1. New Tables
    - `rcon_servers`
      - `id` (uuid, primary key)
      - `map_name` (text) - Display name of the map (e.g., "Map Island")
      - `host` (text) - IP address of the RCON server
      - `rcon_port` (integer) - RCON port number
      - `rcon_password` (text) - RCON password (encrypted at rest by Supabase)
      - `sort_order` (integer) - Display ordering
      - `enabled` (boolean) - Whether this server is active
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `rcon_servers` table
    - Add read-only policy for anonymous users (server list is public info, passwords excluded via API)
    - No insert/update/delete policies for public access

  3. Initial Data
    - 7 ARK: Survival Ascended servers with RCON configurations
*/

CREATE TABLE IF NOT EXISTS rcon_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_name text NOT NULL,
  host text NOT NULL,
  rcon_port integer NOT NULL,
  rcon_password text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rcon_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read server list"
  ON rcon_servers
  FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

INSERT INTO rcon_servers (map_name, host, rcon_port, rcon_password, sort_order) VALUES
  ('Map Ascension', '176.9.111.114', 32348, 'mogo69', 1),
  ('Map Astraeos', '176.9.111.114', 32342, 'mogo69', 2),
  ('Map Extinction', '176.9.111.114', 32344, 'mogo69', 3),
  ('Map Island', '176.9.111.114', 32341, 'mogo69', 4),
  ('Map Lost Colony', '176.9.111.114', 32340, 'mogo69', 5),
  ('Map Ragnarok', '176.9.111.114', 32338, 'mogo69', 6),
  ('Map Valguero', '176.9.111.114', 32345, 'mogo69', 7);
