/**
 * Prisma Client singleton.
 *
 * WHY THIS FILE EXISTS:
 * In development, Next.js hot-reloads your code on every save. If we created a
 * `new PrismaClient()` at module scope each time, every reload would open a NEW
 * database connection — and within seconds you'd exhaust MongoDB's connection
 * limit ("too many connections" errors).
 *
 * THE FIX (the "singleton" pattern):
 * We cache ONE PrismaClient instance on the Node.js `globalThis` object. Because
 * `globalThis` survives hot reloads, we reuse the same instance instead of making
 * a new one every time. In production there are no hot reloads, so we just create
 * it once normally.
 *
 * USAGE:
 *   import { prisma } from "@/lib/prisma";
 *   const kids = await prisma.child.findMany();
 */
import { PrismaClient } from "@prisma/client";

// A helper so the instance is created the same way everywhere.
const prismaClientSingleton = () => {
  return new PrismaClient({
    // In dev, log queries + errors to help learning/debugging. In prod, errors only.
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

// Tell TypeScript that `globalThis` may carry our cached client.
type GlobalWithPrisma = typeof globalThis & {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

// Reuse the cached instance if it exists; otherwise create one.
export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

// In development, store it on globalThis so the next hot reload reuses it.
// In production we deliberately DON'T, so the global stays clean.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
