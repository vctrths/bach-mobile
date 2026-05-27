export interface Garden {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  imageUrl: string | null;
  appliances: string[] | null;
  ownerId?: string | null;
  createdAt?: string;
  owner?: {
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    description: string | null;
    rating: number | null;
  };
}

export interface Review {
  id: string;
  collaborationId: string;
  reviewerId: string;
  targetId: string;
  targetType: "garden" | "user";
  rating: number;
  comment: string | null;
  createdAt: string;
  profiles?: {
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  };
}

export interface Collaboration {
  id: string;
  gardenId: string;
  gardenerId: string;
  ownerId: string;
  requestId: string | null;
  status: "active" | "paused" | "ended";
  terms: string | null;
  days: string[];
  startDate: string | null;
  collaborationType: string | null;
  endedAt: string | null;
  endedBy: string | null;
  endedReason: string | null;
  createdAt: string;
  gardens?: Garden;
  profiles?: {
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  };
}
