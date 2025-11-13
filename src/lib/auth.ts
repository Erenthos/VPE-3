import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Hash a password
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Validate password during login
export async function verifyPassword(password: string, hashed: string) {
  return await bcrypt.compare(password, hashed);
}

// Signup helper
export async function createUser(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");

  const hashed = await hashPassword(password);

  return prisma.user.create({
    data: { name, email, password: hashed }
  });
}

// Login helper (used in NextAuth Credentials Provider)
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;

  return user;
}

