import { prisma } from "../../lib/db/prisma.js";
import type { ProductRecord } from "./products.types.js";

export async function listProductRecords(): Promise<ProductRecord[]> {
  const products = await prisma.product.findMany({
    orderBy: {
      sortOrder: "asc"
    }
  });

  return products.map(mapProductRecord);
}

export async function findProductRecordBySlug(slug: string): Promise<ProductRecord | null> {
  const product = await prisma.product.findUnique({
    where: {
      slug
    }
  });

  return product ? mapProductRecord(product) : null;
}

function mapProductRecord(product: {
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
}) {
  const record: ProductRecord = {
    id: product.id,
    sortOrder: product.sortOrder,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    image: product.image,
    highlights: product.highlights,
    includes: product.includes
  };

  return record;
}
