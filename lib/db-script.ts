// Used by standalone scripts (seed, workers) that import outside Next.js
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export function createScriptDb(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}
