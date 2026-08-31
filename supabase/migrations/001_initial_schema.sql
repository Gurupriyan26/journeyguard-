-- JourneyGuard Database Schema & Row Level Security (RLS) Policies

-- 1. Create tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traveller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  traveller_name TEXT,
  traveller_phone TEXT,
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  start_name TEXT,
  destination_name TEXT NOT NULL,
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alter existing trips table in case it was created earlier
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS traveller_name TEXT;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS traveller_phone TEXT;

CREATE TABLE IF NOT EXISTS public.trip_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  speed_kmh DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  battery_level INTEGER,
  is_charging BOOLEAN,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alter existing trip_locations table in case it was created earlier
ALTER TABLE public.trip_locations ADD COLUMN IF NOT EXISTS speed_kmh DOUBLE PRECISION;
ALTER TABLE public.trip_locations ADD COLUMN IF NOT EXISTS heading DOUBLE PRECISION;
ALTER TABLE public.trip_locations ADD COLUMN IF NOT EXISTS battery_level INTEGER;
ALTER TABLE public.trip_locations ADD COLUMN IF NOT EXISTS is_charging BOOLEAN;

CREATE TABLE IF NOT EXISTS public.guardian_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  access_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trip_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  guardian_access_id UUID REFERENCES public.guardian_access(id) ON DELETE SET NULL,
  threshold_km DOUBLE PRECISION NOT NULL,
  triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_trip_locations_trip_recorded 
  ON public.trip_locations(trip_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_guardian_access_token_hash 
  ON public.guardian_access(access_token_hash);

CREATE INDEX IF NOT EXISTS idx_trip_alerts_trip 
  ON public.trip_alerts(trip_id, threshold_km);

CREATE INDEX IF NOT EXISTS idx_trips_status 
  ON public.trips(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_alerts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Allow public insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow insert trips" ON public.trips
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read active trips" ON public.trips
  FOR SELECT USING (true);

CREATE POLICY "Allow update own trips" ON public.trips
  FOR UPDATE USING (true);

CREATE POLICY "Allow insert trip locations" ON public.trip_locations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select trip locations" ON public.trip_locations
  FOR SELECT USING (true);

CREATE POLICY "Allow insert guardian access" ON public.guardian_access
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select guardian access" ON public.guardian_access
  FOR SELECT USING (true);

CREATE POLICY "Allow insert trip alerts" ON public.trip_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select trip alerts" ON public.trip_alerts
  FOR SELECT USING (true);

CREATE POLICY "Allow update trip alerts" ON public.trip_alerts
  FOR UPDATE USING (true);
