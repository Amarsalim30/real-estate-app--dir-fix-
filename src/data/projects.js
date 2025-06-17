export const Projects = [
  {
    id: 1,
    name: "Skyline Tower",
    description: "Luxury residential tower in downtown with premium amenities",
    location: "Downtown Manhattan",
    address: "123 Skyline Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    totalUnits: 120,
    availableUnits: 45,
    reservedUnits: 25,
    soldUnits: 50,
    constructionProgress: 85,
    status: "under_construction", // planning, under_construction, completed
    startDate: new Date("2023-01-15"),
    expectedCompletion: new Date("2024-12-31"),
    developer: "Premium Developments LLC",
    images: [
      "/images/projects/skyline-tower-1.jpg",
      "/images/projects/skyline-tower-2.jpg",
    ],
    amenities: ["Gym", "Pool", "Concierge", "Parking", "Rooftop Garden"],
    priceRange: {
      min: 450000,
      max: 1200000
    },
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Garden Heights",
    description: "Family-friendly residential complex with green spaces",
    location: "Brooklyn Heights",
    address: "456 Garden Street",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    totalUnits: 80,
    availableUnits: 30,
    reservedUnits: 15,
    soldUnits: 35,
    constructionProgress: 100,
    status: "completed",
    startDate: new Date("2022-03-01"),
    expectedCompletion: new Date("2023-11-30"),
    developer: "Green Living Corp",
    images: [
      "/images/projects/garden-heights-1.jpg",
      "/images/projects/garden-heights-2.jpg",
    ],
    amenities: ["Playground", "Garden", "Community Center", "Parking"],
    priceRange: {
      min: 350000,
      max: 750000
    },
    createdAt: new Date("2022-01-01"),
    updatedAt: new Date("2023-12-01"),
  }
];
