export interface Garden {
  id: string;
  name: string;
  rating: number | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  image_url: string | null;
  appliances: string[] | null;
}

export interface Review {
  id: string;
  collaboration_id: string;
  reviewer_id: string;
  target_id: string;
  target_type: "garden" | "user";
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    profile_image: string | null;
  };
}

export interface Collaboration {
  id: string;
  garden_id: string;
  gardener_id: string;
  owner_id: string;
  request_id: string | null;
  status: "active" | "paused" | "ended";
  terms: string | null;
  days: string[];
  start_date: string | null;
  collaboration_type: string | null;
  ended_at: string | null;
  ended_by: string | null;
  ended_reason: string | null;
  created_at: string;
  gardens?: Garden;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    profile_image: string | null;
  };
}
