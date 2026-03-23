const listings = [
  {
    id: 1,
    title: "Spacious 3BR Apartment Near College Ave",
    address: "12 Bartlett Street, New Brunswick, NJ 08901",
    price: 2400,
    beds: 3,
    baths: 2,
    propertyType: "apartment",
    distance: 0.3,
    campus: "College Ave",
    description:
      "Bright three-bedroom apartment with a large common area, updated kitchen, and a short walk to restaurants and Rutgers buses.",
    amenities: {
      Parking: true,
      Laundry: true,
      Pet_Friendly: false,
      Furnished: false,
    },
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    images: [
      {
        name: "Living room",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
      },
      {
        name: "Kitchen",
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
      },
    ],
    landlordNum: "1-800-800-8000",
    landlordEmail: "example@gmail.com",
    available_from: "2026-05-20",
    available_to: "2026-08-15",
  },
  {
    id: 2,
    title: "Modern 2BR on Easton Ave",
    address: "29 Easton Avenue, New Brunswick, NJ 08901",
    price: 1800,
    beds: 2,
    baths: 1,
    propertyType: "apartment",
    distance: 0.5,
    campus: "College Ave",
    description:
      "Modern two-bedroom unit with furnished bedrooms, in-building laundry, and quick access to downtown New Brunswick.",
    amenities: {
      Parking: true,
      Laundry: true,
      Pet_Friendly: true,
      Furnished: true,
    },
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    images: [
      {
        name: "Front room",
        url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      },
      {
        name: "Bedroom",
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      },
    ],
    landlordNum: "1-732-555-2400",
    landlordEmail: "easton@example.com",
    available_from: "2026-06-01",
    available_to: "2026-08-28",
  },
];

export default listings;
