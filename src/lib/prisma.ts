import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.DEBUG_PRISMA === "true" ? ["warn", "error"] : ["warn"],
  });

// Always attach to global to prevent connection leaks across hot-reloads or multiple imports
globalForPrisma.prisma = prisma;
