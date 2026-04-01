import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { serializeCookie } from "../../lib/cookies.js";
import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser
} from "./auth.service.js";
import {
  loginSchema,
  parseSessionCookie,
  registerSchema
} from "./auth.validation.js";

function getSessionSameSitePolicy() {
  return env.NODE_ENV === "production" ? "None" : "Lax";
}

function appendSessionCookie(response: Response, sessionToken: string, expiresAt: string) {
  response.append(
    "Set-Cookie",
    serializeCookie(env.SESSION_COOKIE_NAME, sessionToken, {
      expires: new Date(expiresAt),
      httpOnly: true,
      path: "/",
      sameSite: getSessionSameSitePolicy(),
      secure: env.NODE_ENV === "production"
    })
  );
}

export async function handleLogin(request: Request, response: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(request.body);
    const result = await loginUser(input);

    appendSessionCookie(response, result.sessionToken, result.expiresAt);

    response.status(200).json({
      message: "Login successful.",
      data: {
        expiresAt: result.expiresAt,
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetCurrentUser(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const sessionToken = parseSessionCookie(request.headers.cookie, env.SESSION_COOKIE_NAME);
    const user = await getAuthenticatedUser(sessionToken);

    response.status(200).json({
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLogout(request: Request, response: Response, next: NextFunction) {
  try {
    const sessionToken = parseSessionCookie(request.headers.cookie, env.SESSION_COOKIE_NAME);
    await logoutUser(sessionToken);

    response.append(
      "Set-Cookie",
      serializeCookie(env.SESSION_COOKIE_NAME, "", {
        expires: new Date(0),
        httpOnly: true,
        path: "/",
        sameSite: getSessionSameSitePolicy(),
        secure: env.NODE_ENV === "production"
      })
    );

    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function handleRegister(request: Request, response: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(request.body);
    const result = await registerUser({
      email: input.email,
      password: input.password,
      displayName: input.displayName,
      phone: input.phone || null
    });

    appendSessionCookie(response, result.sessionToken, result.expiresAt);

    response.status(201).json({
      message: "Registration successful.",
      data: {
        expiresAt: result.expiresAt,
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
}
