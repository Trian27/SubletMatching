export type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  beds: number;
  propertyType: string;
  distance: number;
  image_url: string | null;
  campus_location: string | null;
  host_id: string | null;
};
