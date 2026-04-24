-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  business_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Express tables
CREATE TABLE public.express_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  route TEXT NOT NULL,
  earnings NUMERIC NOT NULL DEFAULT 0,
  fuel NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.express_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.express_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  client TEXT NOT NULL,
  type TEXT NOT NULL,
  rate NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.express_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  type TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.express_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  note TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'good',
  msg TEXT DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dupart
CREATE TABLE public.dupart_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  stock NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.dupart_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  cash NUMERIC NOT NULL DEFAULT 0,
  change NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ghetto
CREATE TABLE public.ghetto_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client TEXT NOT NULL,
  type TEXT NOT NULL,
  item TEXT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  size TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  date DATE NOT NULL,
  notes TEXT DEFAULT '',
  dp NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.ghetto_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT DEFAULT '',
  stock NUMERIC NOT NULL DEFAULT 0,
  reorder NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS + per-user policies on all data tables
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'express_trips','express_expenses','express_bookings','express_clients','express_maintenance',
    'dupart_products','dupart_sales','ghetto_orders','ghetto_materials'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "select own" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "insert own" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "update own" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "delete own" ON public.%I FOR DELETE USING (auth.uid() = user_id)', t);
  END LOOP;
END $$;

-- Indexes
CREATE INDEX ON public.express_trips(user_id, date DESC);
CREATE INDEX ON public.express_expenses(user_id, date DESC);
CREATE INDEX ON public.express_bookings(user_id, date DESC);
CREATE INDEX ON public.express_clients(user_id);
CREATE INDEX ON public.express_maintenance(user_id, sort_order);
CREATE INDEX ON public.dupart_products(user_id);
CREATE INDEX ON public.dupart_sales(user_id, created_at DESC);
CREATE INDEX ON public.ghetto_orders(user_id, date DESC);
CREATE INDEX ON public.ghetto_materials(user_id);

-- Auto-create profile + seed demo data on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid UUID := NEW.id;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (uid, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  -- Express trips
  INSERT INTO public.express_trips (user_id, date, type, route, earnings, fuel, notes) VALUES
    (uid, CURRENT_DATE - 4, 'Lalamove', 'Laguna → Pasay', 850, 200, ''),
    (uid, CURRENT_DATE - 3, 'Rental – Full Day', 'Biñan → Tagaytay', 3500, 600, 'Client: Mark'),
    (uid, CURRENT_DATE - 2, 'Lalamove', 'San Pedro → Parañaque', 620, 150, '');

  INSERT INTO public.express_expenses (user_id, date, category, description, amount) VALUES
    (uid, CURRENT_DATE - 9, 'Maintenance', 'Oil change', 800),
    (uid, CURRENT_DATE - 6, 'Repair', 'Brake pads', 1200);

  INSERT INTO public.express_bookings (user_id, date, client, type, rate, notes) VALUES
    (uid, CURRENT_DATE + 4, 'Mark Santos', 'Rental – Full Day', 3500, 'Tagaytay trip'),
    (uid, CURRENT_DATE + 8, 'Anna Reyes', 'Rental – Half Day', 2000, 'Airport pickup');

  INSERT INTO public.express_clients (user_id, name, phone, address, type, notes) VALUES
    (uid, 'Mark Santos', '09171234567', 'Biñan, Laguna', 'Rental', 'Regular client'),
    (uid, 'Anna Reyes', '09281234567', 'Parañaque', 'Rental', 'Airport runs');

  INSERT INTO public.express_maintenance (user_id, label, note, status, msg, sort_order) VALUES
    (uid, 'Oil Change', 'Every 5,000 km / 3 months', 'good', 'Up to date', 1),
    (uid, 'Tire Rotation', 'Due in: 2 weeks', 'warn', 'Schedule soon', 2),
    (uid, 'LTO Registration', 'Expires: June 2025', 'alert', 'Renewal required', 3),
    (uid, 'Air Filter', 'Replaced: March 2025', 'good', 'Good condition', 4),
    (uid, 'Battery Check', 'Last checked: Feb 2025', 'warn', 'Check soon', 5),
    (uid, 'Brake Fluid', 'Next: 20,000 km', 'good', 'Up to date', 6);

  -- Dupart products
  INSERT INTO public.dupart_products (user_id, name, price, cost, stock) VALUES
    (uid, 'Classic Hotdog', 25, 12, 50),
    (uid, 'Jumbo Hotdog', 35, 18, 40),
    (uid, 'Cheesy Dog', 40, 20, 30),
    (uid, 'Spicy Dog', 35, 17, 35),
    (uid, 'Corn Dog', 30, 14, 25),
    (uid, 'Double Dog', 50, 26, 20),
    (uid, 'Softdrink (330ml)', 20, 10, 60),
    (uid, 'Bottled Water', 10, 5, 80);

  -- Ghetto orders
  INSERT INTO public.ghetto_orders (user_id, client, type, item, qty, size, price, status, date, notes, dp) VALUES
    (uid, 'Juan dela Cruz', 'DTF Print', 'T-shirt', 12, 'A4', 840, 'In Progress', CURRENT_DATE - 4, 'White shirt, full color', 420),
    (uid, 'Maria Santos', 'Silkscreen', 'Polo', 24, 'A3', 2400, 'Pending', CURRENT_DATE - 3, '2-color, black ink', 1200),
    (uid, 'Pedro Garcia', 'DTF Print', 'Hoodie', 6, 'A4', 900, 'For Pickup', CURRENT_DATE - 5, '', 0);

  INSERT INTO public.ghetto_materials (user_id, name, unit, stock, reorder) VALUES
    (uid, 'DTF Film Roll (30cm)', 'meters', 45, 10),
    (uid, 'DTF Ink Set (CMYK+W)', 'sets', 3, 2),
    (uid, 'Hot Melt Adhesive Powder', 'kg', 2.5, 1),
    (uid, 'Silkscreen Ink – Black', 'liters', 1.2, 0.5),
    (uid, 'Silkscreen Ink – Colors', 'liters', 0.8, 0.5),
    (uid, 'Silk Mesh Frames (A3)', 'pcs', 8, 3),
    (uid, 'Emulsion (for silkscreen)', 'liters', 0.6, 0.3);

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();