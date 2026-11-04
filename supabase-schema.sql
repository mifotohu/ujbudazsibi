-- ====================================================================
-- Újbudazsibi (www.ujbudazsibi.hu) — Supabase PostgreSQL Adatbázis Séma
-- Készült: Vercel + Supabase telepítéshez
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
  status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled
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

-- 6. Anonim közösségi vélemények (csak adminisztrátori hozzáféréssel)
CREATE TABLE IF NOT EXISTS public.market_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  atmosphere_rating INTEGER,
  organization_rating INTEGER,
  feedback_text TEXT,
  seller_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Szabályok
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_flea_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.street_musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_reviews ENABLE ROW LEVEL SECURITY;

-- Nyilvános olvasás az asztalok foglaltsági állapotához (anonimizált nézet):
CREATE OR REPLACE VIEW public.public_table_status AS
  SELECT table_id, location_id, status, categories, items_description,
         CONCAT(LEFT(seller_name, 1), '. ', SUBSTRING(seller_name FROM POSITION(' ' IN seller_name) + 1)) AS display_name
  FROM public.bookings
  WHERE status = 'confirmed';
