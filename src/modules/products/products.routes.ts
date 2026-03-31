import { Router } from "express";
import {
  handleGetProductBySlug,
  handleListFeaturedProducts,
  handleListNewArrivalProducts,
  handleListProducts,
  handleListProductSlugs
} from "./products.controller.js";

export const productsRouter = Router();

productsRouter.get("/", handleListProducts);
productsRouter.get("/featured", handleListFeaturedProducts);
productsRouter.get("/new-arrivals", handleListNewArrivalProducts);
productsRouter.get("/slugs", handleListProductSlugs);
productsRouter.get("/:slug", handleGetProductBySlug);
