import { createHmac, timingSafeEqual } from "crypto";

// HMAC of the userId using the app's existing AUTH_SECRET -- no new token table
// needed, and it's stateless (verifiable without a DB round-trip).
function sign(userId: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "").update(userId).digest("hex");
}

export function makeUnsubscribeToken(userId: string): string {
  return sign(userId);
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = sign(userId);
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
