import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { HttpError } from "./lib/httpError.js";
import { authRouter } from "./modules/auth/index.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      message: "Commerce service is running.",
      docs: {
        health: "/health",
        products: `${env.API_PREFIX}/products`,
        authLogin: `${env.API_PREFIX}/auth/login`
      }
    });
  });

  app.use("/health", healthRouter);
  app.use(`${env.API_PREFIX}/products`, productsRouter);
  app.use(`${env.API_PREFIX}/auth`, authRouter);

  app.use((request, _response, next) => {
    next(new HttpError(404, `Route ${request.method} ${request.originalUrl} was not found.`));
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Validation failed.",
        issues: error.issues
      });
      return;
    }

    if (error instanceof HttpError) {
      response.status(error.statusCode).json({
        message: error.message
      });
      return;
    }

    console.error(error);

    response.status(500).json({
      message: "Internal server error."
    });
  });

  return app;
}
