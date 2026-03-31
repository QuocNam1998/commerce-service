import { createHash } from "node:crypto";
import { prisma } from "../../lib/db/prisma.js";
import type { AuthSessionRecord } from "./auth.types.js";

export async function saveSession(session: AuthSessionRecord) {
  await prisma.authSession.create({
    data: {
      tokenHash: session.tokenHash,
      userId: session.userId,
      expiresAt: new Date(session.expiresAt),
      createdAt: new Date(session.createdAt)
    }
  });

  return session;
}

export async function findSessionByToken(token: string) {
  const session = await prisma.authSession.findUnique({
    where: {
      tokenHash: hashToken(token)
    }
  });

  if (!session) {
    return null;
  }

  const record: AuthSessionRecord = {
    tokenHash: session.tokenHash,
    userId: session.userId,
    expiresAt: session.expiresAt.toISOString(),
    createdAt: session.createdAt.toISOString()
  };

  return record;
}

export async function deleteSessionByToken(token: string) {
  await prisma.authSession.deleteMany({
    where: {
      tokenHash: hashToken(token)
    }
  });
}

export function createTokenHash(token: string) {
  return hashToken(token);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
