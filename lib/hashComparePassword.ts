import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

/**
 * Hash a plain text password.
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword (password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password.
 * @param plainPassword - The plain text password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to `true` if the passwords match, otherwise `false`.
 */
export async function comparePassword (plainPassword: string, hashedPassword: string): Promise<boolean>  {
  return await bcrypt.compare(plainPassword, hashedPassword)
}
