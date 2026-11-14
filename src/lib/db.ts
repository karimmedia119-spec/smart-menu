/**
 * Smart Menu Database Client Layer
 * Supports Free PostgreSQL Cloud Databases:
 * 1. Supabase (Free 500MB tier, SSL enabled)
 * 2. Neon.tech (Free Serverless PostgreSQL)
 * 3. Render / Railway Free PostgreSQL
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

/**
 * Check if live database is reachable
 */
export async function checkDatabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        ok: false,
        message: "لم يتم ضبط متغير DATABASE_URL. النظام يعمل بنجاح بالذاكرة التخزينية المدمجة.",
      };
    }
    await db.$queryRaw`SELECT 1`;
    return { ok: true, message: "تم الاتصال بقاعدة بيانات PostgreSQL السحابية بنجاح!" };
  } catch (error: any) {
    return { ok: false, message: error?.message || "تعذر الاتصال بقاعدة البيانات" };
  }
}
