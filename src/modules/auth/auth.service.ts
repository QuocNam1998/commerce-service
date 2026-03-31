import { randomBytes } from "node:crypto";
import { HttpError } from "../../lib/httpError.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { AUTH_SESSION_TTL_MS } from "./auth.constants.js";
import {
  createTokenHash,
  deleteSessionByToken,
  findSessionByToken,
  saveSession
} from "./auth.session.repository.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdentifier,
  findUserByPhone
} from "./auth.repository.js";
import type {
  AuthenticatedUser,
  LoginInput,
  LoginResult,
  RegisterInput
} from "./auth.types.js";

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await findUserByIdentifier(input.identifier);

  if (!user) {
    throw new HttpError(401, "Invalid credentials.");
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid credentials.");
  }

  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + AUTH_SESSION_TTL_MS).toISOString();

  await saveSession({
    tokenHash: createTokenHash(sessionToken),
    userId: user.id,
    expiresAt,
    createdAt: new Date().toISOString()
  });

  return {
    sessionToken,
    expiresAt,
    user: sanitizeUser(user)
  };
}

export async function getAuthenticatedUser(sessionToken: string): Promise<AuthenticatedUser> {
  const session = await findSessionByToken(sessionToken);

  if (!session) {
    throw new HttpError(401, "Authentication is required.");
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await deleteSessionByToken(sessionToken);
    throw new HttpError(401, "Session has expired.");
  }

  const user = await findUserById(session.userId);

  if (!user) {
    await deleteSessionByToken(sessionToken);
    throw new HttpError(401, "Authentication is required.");
  }

  return sanitizeUser(user);
}

export async function logoutUser(sessionToken: string) {
  await deleteSessionByToken(sessionToken);
}

export async function registerUser(input: RegisterInput): Promise<LoginResult> {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.replace(/\D/g, "") ?? "";

  const [existingEmailUser, existingPhoneUser] = await Promise.all([
    findUserByEmail(email),
    phone ? findUserByPhone(phone) : Promise.resolve(null)
  ]);

  if (existingEmailUser) {
    throw new HttpError(409, "This email is already registered.");
  }

  if (existingPhoneUser) {
    throw new HttpError(409, "This phone number is already registered.");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email,
    phone: phone || null,
    displayName: input.displayName,
    passwordHash
  });

  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + AUTH_SESSION_TTL_MS).toISOString();

  await saveSession({
    tokenHash: createTokenHash(sessionToken),
    userId: user.id,
    expiresAt,
    createdAt: new Date().toISOString()
  });

  return {
    sessionToken,
    expiresAt,
    user: sanitizeUser(user)
  };
}

function sanitizeUser(user: {
  id: string;
  email: string;
  phone: string | null;
  displayName: string;
  role: "customer" | "admin";
  createdAt: string;
}): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt
  };
}
