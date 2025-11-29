import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { attachDatabasePool } from "@vercel/functions";
import process from "node:process";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

let poolInstance;
let prismaInstance;

function getPool() {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    attachDatabasePool(poolInstance);
  }
  return poolInstance;
}

export function getPrisma() {
  if (!prismaInstance) {
    const adapter = new PrismaPg({ pool: getPool() });
    prismaInstance = new PrismaClient({
      adapter,
      log:
        process.env.ENVIRONMENT !== "production"
          ? ["error", "warn"]
          : ["error"],
    });
  }
  return prismaInstance;
}

export const prisma = getPrisma();
