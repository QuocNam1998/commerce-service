import type { NextFunction, Request, Response } from "express";
import {
  getProductBySlug,
  listFeaturedProducts,
  listNewArrivalProducts,
  listProducts,
  listProductSlugs
} from "./products.service.js";
import { productSlugParamsSchema } from "./products.validation.js";

export async function handleListProducts(
  _request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const products = await listProducts();

    response.json({
      data: products,
      meta: {
        count: products.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function handleListFeaturedProducts(
  _request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const products = await listFeaturedProducts();

    response.json({
      data: products
    });
  } catch (error) {
    next(error);
  }
}

export async function handleListNewArrivalProducts(
  _request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const products = await listNewArrivalProducts();

    response.json({
      data: products
    });
  } catch (error) {
    next(error);
  }
}

export async function handleListProductSlugs(
  _request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const slugs = await listProductSlugs();

    response.json({
      data: slugs
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetProductBySlug(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const { slug } = productSlugParamsSchema.parse(request.params);
    const product = await getProductBySlug(slug);

    response.json({
      data: product
    });
  } catch (error) {
    next(error);
  }
}
