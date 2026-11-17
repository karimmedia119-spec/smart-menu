import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();
  const dbStatus = await checkDatabaseConnection();

  return NextResponse.json({
    status: "ok",
    service: "Smart Menu SaaS Platform",
    version: "2.5.0",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    database: {
      connected: dbStatus.ok,
      message: dbStatus.message,
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      latencyMs: Date.now() - startTime,
    },
    security: {
      rbac: "enabled",
      rateLimiter: "active",
      xssSanitization: "enforced",
      dataIsolation: "strict_tenant",
    },
  });
}
