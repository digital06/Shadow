/*
  # App ownership and settings

  Enables any deployer of this site to configure their own Tip4Serv
  API key directly from the UI — without editing Edge Function
  secrets or environment variables.

  1. New tables
    - `app_owner` (singleton)
      - `id` (smallint, primary key, always 1 — enforced)
      - `user_id` (uuid, references auth.users) — claims ownership
      - `claimed_at` (timestamptz)
    - `app_settings`
      - `key` (text, primary key)
      - `value` (text) — sensitive; readable only by the owner
      - `updated_at` (timestamptz)

  2. Functions
    - `public.has_owner()` — returns true if ownership has been
      claimed. Callable anonymously so the UI can decide between
      "claim ownership" and "login" without leaking who the owner is.
    - `public.is_owner()` — returns true if the caller is the owner.

  3. Security
    - RLS enabled on both tables.
    - `app_owner`:
      * anon/authenticated cannot SELECT directly (user_id is not
        leaked); ownership existence is exposed via has_owner() only.
      * authenticated users may INSERT only to claim the singleton
        row, only for themselves, only if no owner exists yet.
      * UPDATE/DELETE blocked for everyone — ownership is permanent
        unless manually changed with service_role.
    - `app_settings`:
      * Only the current owner may SELECT / INSERT / UPDATE / DELETE.
      * The Edge Function reads values using service_role, which
        bypasses RLS.
*/

CREATE TABLE IF NOT EXISTS app_owner (
  id smallint PRIMARY KEY DEFAULT 1,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_owner_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM app_owner WHERE id = 1);
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_owner
    WHERE id = 1 AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_owner() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated;

DROP POLICY IF EXISTS "Owner can read ownership" ON app_owner;
CREATE POLICY "Owner can read ownership"
  ON app_owner FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated user can claim ownership" ON app_owner;
CREATE POLICY "Authenticated user can claim ownership"
  ON app_owner FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM app_owner WHERE id = 1)
  );

DROP POLICY IF EXISTS "Owner can read settings" ON app_settings;
CREATE POLICY "Owner can read settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "Owner can insert settings" ON app_settings;
CREATE POLICY "Owner can insert settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Owner can update settings" ON app_settings;
CREATE POLICY "Owner can update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Owner can delete settings" ON app_settings;
CREATE POLICY "Owner can delete settings"
  ON app_settings FOR DELETE
  TO authenticated
  USING (public.is_owner());
