export const serviceCategories = [
  "Brake Change",
  "Oil Change", 
  "Tire Change",
  "General Checkup",
  "Engine Repair",
  "Battery Replacement",
  "AC Service",
  "Transmission Repair"
];

export const mockMechanics = [
  {
    id: "1",
    name: "Mike Rodriguez",
    shopName: "Rodriguez Auto Repair",
    address: "1234 Main St, Downtown",
    phone: "(555) 123-4567",
    rating: 4.8,
    reviewCount: 156,
    distance: "0.3 miles",
    specialties: ["Brake Service", "Engine Repair", "Diagnostics"],
    services: [
      { name: "Brake Pad Replacement", price: "$89-159" },
      { name: "Oil Change (Synthetic)", price: "$45-65" },
      { name: "Engine Diagnostic", price: "$120-180" },
      { name: "Tire Rotation", price: "$25-45" }
    ]
  },
  {
    id: "2", 
    name: "Sarah Chen",
    shopName: "Precision Auto Care",
    address: "567 Oak Avenue, Midtown",
    phone: "(555) 234-5678",
    rating: 4.9,
    reviewCount: 203,
    distance: "0.7 miles",
    specialties: ["AC Service", "Electrical", "Transmission"],
    services: [
      { name: "AC System Service", price: "$95-145" },
      { name: "Transmission Flush", price: "$150-200" },
      { name: "Battery Replacement", price: "$120-180" },
      { name: "Alternator Repair", price: "$200-350" }
    ]
  },
  {
    id: "3",
    name: "Tommy Williams", 
    shopName: "Quick Fix Garage",
    address: "890 Pine Street, Westside",
    phone: "(555) 345-6789",
    rating: 4.6,
    reviewCount: 89,
    distance: "1.2 miles",
    specialties: ["Oil Change", "Tire Service", "Quick Repairs"],
    services: [
      { name: "Express Oil Change", price: "$35-55" },
      { name: "Tire Installation", price: "$25-40" },
      { name: "Tire Balancing", price: "$15-25" },
      { name: "Filter Replacement", price: "$20-35" }
    ]
  },
  {
    id: "4",
    name: "Lisa Johnson",
    shopName: "Johnson's Complete Auto",
    address: "456 Elm Drive, Eastside", 
    phone: "(555) 456-7890",
    rating: 4.7,
    reviewCount: 124,
    distance: "1.8 miles", 
    specialties: ["General Maintenance", "Brakes", "Suspension"],
    services: [
      { name: "General Checkup", price: "$75-125" },
      { name: "Brake System Check", price: "$45-75" },
      { name: "Suspension Repair", price: "$200-400" },
      { name: "Wheel Alignment", price: "$80-120" }
    ]
  },
  {
    id: "5",
    name: "Carlos Martinez",
    shopName: "Martinez Automotive",
    address: "321 Maple Lane, Southside",
    phone: "(555) 567-8901", 
    rating: 4.5,
    reviewCount: 67,
    distance: "2.1 miles",
    specialties: ["Engine Repair", "Diagnostics", "Performance"],
    services: [
      { name: "Engine Rebuild", price: "$2500-4000" },
      { name: "Performance Tune-up", price: "$150-250" },
      { name: "Computer Diagnostics", price: "$100-150" },
      { name: "Fuel System Service", price: "$120-180" }
    ]
  }
];