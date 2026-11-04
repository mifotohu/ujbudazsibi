-- ====================================================================
-- Újbudazsibi (www.ujbudazsibi.hu) — Supabase PostgreSQL Adatbázis Séma
-- Készült: Vercel + Supabase éles telepítéshez
-- ====================================================================
-- 
-- HASZNÁLATI ÚTMUTATÓ:
-- 1. Nyisd meg a https://supabase.com oldalt és lépj be a projektedbe.
-- 2. A bal oldali menüben kattints a 'SQL Editor' ikonra.
-- 3. Kattints a 'New Query' gombra, másold be az ALÁBBI TELJES SZÖVEGET,
--    majd nyomd meg a zöld 'RUN' (Futtatás) gombot.
-- 4. Ez létrehozza az összes táblát, indexet és a Row Level Security (RLS)
--    jogosultságokat, így a weboldal azonnal és hibamentesen tud írni/olvasni!
-- ====================================================================

-- 1. Árusok és asztalfoglalások tábla
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref VARCHAR(50) UNIQUE NOT NULL,
  table_id INTEGER NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  street_name TEXT NOT NULL,
  weekend_dates VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  seller_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  street_address TEXT NOT NULL,
  is_immediate_neighbor BOOLEAN DEFAULT FALSE,
  categories TEXT[] DEFAULT '{}',
  items_description TEXT,
  total_paid INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed' | 'cancelled'
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Vállalkozói / Céges Koncessziók (Gyereksarok & Grillsarok)
CREATE TABLE IF NOT EXISTS public.commercial_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_type VARCHAR(50) NOT NULL, -- 'kids_corner' | 'grill_corner'
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  weekend_dates VARCHAR(100) NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  tax_number VARCHAR(50) NOT NULL,
  billing_address TEXT NOT NULL,
  contact_person VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  program_or_menu TEXT NOT NULL,
  fee_paid INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Gyerekzsibi tábla (4 ingyenes gyermek asztal)
CREATE TABLE IF NOT EXISTS public.kids_flea_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_code VARCHAR(20) NOT NULL, -- 'GY-1', 'GY-2', 'GY-3', 'GY-4'
  location_id VARCHAR(50) NOT NULL,
  parent_name VARCHAR(150) NOT NULL,
  child_name VARCHAR(150) NOT NULL,
  child_age INTEGER NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  items_description TEXT,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Önkéntesek tábla
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  tasks TEXT[] DEFAULT '{}',
  other_offer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Utcazenész jelentkezések
CREATE TABLE IF NOT EXISTS public.street_musicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  instruments VARCHAR(150),
  location_id VARCHAR(50) NOT NULL,
  preferred_time_slot VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Közösségi vélemények tábla
CREATE TABLE IF NOT EXISTS public.market_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  author_name VARCHAR(150),
  role VARCHAR(50),
  feedback_text TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Értesítési hírsáv tábla (felső piros doboz szinkronizálása)
CREATE TABLE IF NOT EXISTS public.site_notifications (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'current_banner',
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Kiküldött e-mailes értesítések naplója
CREATE TABLE IF NOT EXISTS public.sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient VARCHAR(150) NOT NULL,
  subject TEXT NOT NULL,
  html_preview TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) ÉS HOZZÁFÉRÉSI SZABÁLYOK (POLICIES)
-- Kifejezetten engedélyezzük az anon kulcsos írást/olvasást a weboldalnak!
-- ====================================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_flea_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.street_musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

-- Bookings szabályok:
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read bookings" ON public.bookings;
CREATE POLICY "Public can read bookings" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update bookings" ON public.bookings;
CREATE POLICY "Admin can update bookings" ON public.bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can delete bookings" ON public.bookings;
CREATE POLICY "Admin can delete bookings" ON public.bookings FOR DELETE USING (true);

-- Volunteers szabályok:
DROP POLICY IF EXISTS "Public can insert volunteers" ON public.volunteers;
CREATE POLICY "Public can insert volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read volunteers" ON public.volunteers;
CREATE POLICY "Public can read volunteers" ON public.volunteers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can delete volunteers" ON public.volunteers;
CREATE POLICY "Admin can delete volunteers" ON public.volunteers FOR DELETE USING (true);

-- Commercial szabályok:
DROP POLICY IF EXISTS "Public can insert commercial" ON public.commercial_vendors;
CREATE POLICY "Public can insert commercial" ON public.commercial_vendors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read commercial" ON public.commercial_vendors;
CREATE POLICY "Public can read commercial" ON public.commercial_vendors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can delete commercial" ON public.commercial_vendors;
CREATE POLICY "Admin can delete commercial" ON public.commercial_vendors FOR DELETE USING (true);

-- Kids flea szabályok:
DROP POLICY IF EXISTS "Public can insert kids" ON public.kids_flea_bookings;
CREATE POLICY "Public can insert kids" ON public.kids_flea_bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read kids" ON public.kids_flea_bookings;
CREATE POLICY "Public can read kids" ON public.kids_flea_bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can delete kids" ON public.kids_flea_bookings;
CREATE POLICY "Admin can delete kids" ON public.kids_flea_bookings FOR DELETE USING (true);

-- Street musicians szabályok:
DROP POLICY IF EXISTS "Public can insert musicians" ON public.street_musicians;
CREATE POLICY "Public can insert musicians" ON public.street_musicians FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read musicians" ON public.street_musicians;
CREATE POLICY "Public can read musicians" ON public.street_musicians FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can delete musicians" ON public.street_musicians;
CREATE POLICY "Admin can delete musicians" ON public.street_musicians FOR DELETE USING (true);

-- Reviews szabályok:
DROP POLICY IF EXISTS "Public can insert reviews" ON public.market_reviews;
CREATE POLICY "Public can insert reviews" ON public.market_reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read reviews" ON public.market_reviews;
CREATE POLICY "Public can read reviews" ON public.market_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update reviews" ON public.market_reviews;
CREATE POLICY "Admin can update reviews" ON public.market_reviews FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin can delete reviews" ON public.market_reviews;
CREATE POLICY "Admin can delete reviews" ON public.market_reviews FOR DELETE USING (true);

-- Site notifications szabályok:
DROP POLICY IF EXISTS "Public can read notifications" ON public.site_notifications;
CREATE POLICY "Public can read notifications" ON public.site_notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage notifications" ON public.site_notifications;
CREATE POLICY "Admin can manage notifications" ON public.site_notifications FOR ALL USING (true);

-- Sent emails napló:
DROP POLICY IF EXISTS "Public can insert sent emails" ON public.sent_emails;
CREATE POLICY "Public can insert sent emails" ON public.sent_emails FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read sent emails" ON public.sent_emails;
CREATE POLICY "Admin can read sent emails" ON public.sent_emails FOR SELECT USING (true);

-- ====================================================================
-- Kész! Minden tábla és jogosultság beállítva.
-- ====================================================================
