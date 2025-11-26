import { RateLimiterPrisma } from "rate-limiter-flexible";
import prisma from "./db";
import { auth } from "@clerk/nextjs/server";

const FREE_SANDBOX_RECREATIONS = 5;
const PRO_SANDBOX_RECREATIONS = 20;
const SANDBOX_DURATION = 24 * 60 * 60; // 1 day in seconds
const SANDBOX_RECREATION_COST = 1;

export async function getSandboxRecreationTracker() {
  const { has } = await auth();
  const hasPremiumAccess = has({ plan: "pro" });

  const sandboxTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "SandboxUsage",
    points: hasPremiumAccess
      ? PRO_SANDBOX_RECREATIONS
      : FREE_SANDBOX_RECREATIONS,
    duration: SANDBOX_DURATION,
  });

  return sandboxTracker;
}

export async function consumeSandboxRecreationCredit(userId: string) {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const sandboxTracker = await getSandboxRecreationTracker();
  const result = await sandboxTracker.consume(userId, SANDBOX_RECREATION_COST);
  return result;
}

export async function getSandboxRecreationStatus(userId: string) {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const sandboxTracker = await getSandboxRecreationTracker();
  const result = await sandboxTracker.get(userId);
  return result;
}
