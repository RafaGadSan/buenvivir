// auth.ts
import bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt.
 * @param password The plain text password to hash.
 * @returns A promise that resolves with the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password with a hash to determine if they match.
 * @param password The plain text password.
 * @param hash The hash to compare against.
 * @returns A promise that resolves with a boolean indicating if the password and hash match.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
