import { HttpError } from "../../lib/httpError.js";
import {
  findProductRecordBySlug,
  listProductRecords
} from "./products.repository.js";

export async function listProducts() {
  return listProductRecords();
}

export async function listFeaturedProducts() {
  const products = await listProductRecords();
  return products.slice(0, 3);
}

export async function listNewArrivalProducts() {
  const products = await listProductRecords();
  return products.slice(3);
}

export async function getProductBySlug(slug: string) {
  const product = await findProductRecordBySlug(slug);

  if (!product) {
    throw new HttpError(404, `Product with slug "${slug}" was not found.`);
  }

  return product;
}

export async function listProductSlugs() {
  const products = await listProductRecords();
  return products.map((product) => product.slug);
}
