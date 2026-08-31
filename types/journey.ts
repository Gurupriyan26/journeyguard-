export type TripStatus = 'active' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Trip {
  id: string;
  traveller_id?: string | null;
  traveller_name?: string | null;
  traveller_phone?: string | null;
  start_lat: number;
  start_lng: number;
  start_name?: string | null;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  status: TripStatus;
  default_threshold_km?: number;
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}

export interface TripLocation {
  id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed_kmh?: number | null;
  heading?: number | null;
  battery_level?: number | null;
  is_charging?: boolean | null;
  recorded_at: string;
}

export interface GuardianAccess {
  id: string;
  trip_id: string;
  guardian_role?: string | null; // e.g. "Mom", "Dad", "Family"
  custom_threshold_km?: number | null;
  access_token_hash: string;
  expires_at: string;
  created_at: string;
}

export interface TripAlert {
  id: string;
  trip_id: string;
  guardian_access_id?: string | null;
  threshold_km: number;
  triggered: boolean;
  triggered_at?: string | null;
  created_at: string;
}

export interface ActiveJourneyState {
  trip: Trip;
  latestLocation: TripLocation | null;
  remainingDistanceKm: number;
  alerts: TripAlert[];
  isSharingActive: boolean;
}
