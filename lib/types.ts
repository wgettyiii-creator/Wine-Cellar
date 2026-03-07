export interface CellarWine {
  id: string;
  user_id: string;
  photo_url: string | null;
  name: string;
  producer: string | null;
  vintage: number | null;
  region: string | null;
  country: string | null;
  varietal: string | null;
  quantity: number;
  price_paid: number | null;
  rating: number | null;
  tasting_notes: string | null;
  drink_from: number | null;
  drink_peak_from: number | null;
  drink_peak_to: number | null;
  drink_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface DiningWine {
  id: string;
  user_id: string;
  photo_url: string | null;
  name: string;
  producer: string | null;
  vintage: number | null;
  region: string | null;
  country: string | null;
  varietal: string | null;
  price: number | null;
  rating: number | null;
  tasting_notes: string | null;
  restaurant_name: string | null;
  latitude: number | null;
  longitude: number | null;
  visited_at: string;
  created_at: string;
}

export interface WineAnalysis {
  name: string;
  producer: string | null;
  vintage: number | null;
  region: string | null;
  country: string | null;
  varietal: string | null;
  drink_from: number | null;
  drink_peak_from: number | null;
  drink_peak_to: number | null;
  drink_to: number | null;
}
