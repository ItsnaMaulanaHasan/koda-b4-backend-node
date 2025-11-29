import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
import { attachDatabasePool } from "@vercel/functions";
import process from "node:process";
import { Pool } from "pg";

const { PrismaClient } = pkg;

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
attachDatabasePool(pool);

const adapter = new PrismaPg({ pool });
const prisma = new PrismaClient({ adapter });

export { prisma };
