import crypto from "crypto";
import { env } from "@/config/env";

/**
 * Encrypts / hashes a plain text password using HMAC-SHA256 with the application secret key.
 *
 * @param password The raw password input by the user
 * @returns Hex-encoded encrypted/hashed password string
 */
export function encryptPassword(password: string): string {
  const secret = env.auth.passwordSecretKey;
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

/**
 * Verifies if the entered password matches the stored encrypted password.
 * Uses timing-safe equality comparison to prevent timing attacks.
 *
 * @param enteredPassword The raw password provided during sign-in
 * @param storedEncryptedPassword The encrypted password stored in public.users
 * @returns boolean indicating whether the credentials match
 */
export function verifyPassword(
  enteredPassword: string,
  storedEncryptedPassword?: string | null
): boolean {
  if (!storedEncryptedPassword || !enteredPassword) {
    return false;
  }

  const computedHash = encryptPassword(enteredPassword);

  // Convert to buffers for timing-safe comparison
  const computedBuffer = Buffer.from(computedHash, "hex");
  const storedBuffer = Buffer.from(storedEncryptedPassword, "hex");

  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuffer, storedBuffer);
}
