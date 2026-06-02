import { type Garden } from "@/types/garden";

export const LEGACY_GARDEN_ID_MAP: Record<string, string> = {
  "1": "3a42b613-2fbd-413a-8555-f2c6962e8790",
  "2": "12bdd142-c97c-4539-96a4-76465eb35124",
  "3": "f71f8a1d-04b8-45e7-aa2f-61bcf252aebf",
};

export const DEMO_GARDENS: Record<string, Garden> = {
  "1": {
    id: LEGACY_GARDEN_ID_MAP["1"],
    name: "Groene Heuvel",
    location: "Heverlee",
    latitude: 50.8624,
    longitude: 4.6758,
    description:
      "Gelegen op een zonnige helling in Heverlee. Deze ruime tuin heeft een rijke bodem die perfect is voor een uitgebreide moestuin. Er is al een serre aanwezig voor het kweken van tomaten en paprika's.",
    imageUrl: "https://images.unsplash.com/photo-1598902108854-10e335ad8e2e?w=800",
    appliances: ["water", "greenhouse"],
    owner: {
      firstName: "John",
      lastName: "Doe",
      profileImage: null,
      description: "Gepassioneerde tuinier uit Leuven.",
      rating: 5,
    },
  },
  "2": {
    id: LEGACY_GARDEN_ID_MAP["2"],
    name: "Kruidentuin Kessel-Lo",
    location: "Kessel-Lo",
    latitude: 50.885,
    longitude: 4.723,
    description:
      "Een paradijs voor liefhebbers van geuren en smaken. Deze tuin is volledig ingericht voor de kweek van zeldzame medicinale en culinaire kruiden. Inclusief een actieve composthoop en regentonnen.",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    appliances: ["water", "electricity", "compost"],
    owner: {
      firstName: "John",
      lastName: "Doe",
      profileImage: null,
      description: "Gepassioneerde tuinier uit Leuven.",
      rating: 5,
    },
  },
  "3": {
    id: LEGACY_GARDEN_ID_MAP["3"],
    name: "John's Tuin",
    location: "Willebroek",
    latitude: 51.0606816,
    longitude: 4.3588917,
    description:
      "Een rustige, goed onderhouden tuin in Willebroek. Veel gazon maar ook borders die wachten op een creatieve hand. Perfect voor wie rustig wil beginnen met tuinieren zonder al te veel zwaar werk.",
    imageUrl: "https://images.unsplash.com/photo-1558905757-0bc302685732?w=800",
    appliances: ["water", "tools"],
    owner: {
      firstName: "John",
      lastName: "Doe",
      profileImage: null,
      description: "Gepassioneerde tuinier uit Leuven.",
      rating: 5,
    },
  },
};

export function getGardenLookupId(id: string | undefined) {
  if (!id) return undefined;
  return LEGACY_GARDEN_ID_MAP[id] ?? id;
}

export function getDemoGarden(id: string | undefined) {
  return id ? DEMO_GARDENS[id] : undefined;
}
