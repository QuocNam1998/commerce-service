export type ProductRecord = {
  id: string;
  sortOrder: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  highlights: string[];
  includes: string[];
};
