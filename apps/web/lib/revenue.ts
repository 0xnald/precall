import { eq } from "drizzle-orm";
import { getAddress } from "viem";
import { createDb } from "@precall/shared/db/client";
import { agentConfigs, agentRevenueEvents } from "@precall/shared/db/schema";
import type { AgentRevenueSplit, RevenueEventSourceType } from "@precall/shared/types";

const defaultAgentShareBps = 7_000;
const defaultPlatformShareBps = 3_000;
const usdcScale = 1_000_000n;

function safeShareBps(value: number | null | undefined, fallback: number) {
  return Number.isInteger(value) && value !== null && value !== undefined && value >= 0 ? value : fallback;
}

function toMicroUsdc(value: string | number) {
  const text = String(value).trim();
  const match = text.match(/^(\d+)(?:\.(\d{0,6}))?$/);
  if (!match?.[1]) return 0n;
  const whole = BigInt(match[1]);
  const fractional = BigInt((match[2] || "").padEnd(6, "0"));
  return whole * usdcScale + fractional;
}

function formatMicroUsdc(value: bigint) {
  const whole = value / usdcScale;
  const fractional = (value % usdcScale).toString().padStart(6, "0").replace(/0+$/, "");
  return fractional ? `${whole}.${fractional}` : whole.toString();
}

export function splitRevenueUsdc(amountUsdc: string | number, agentShareBps?: number | null, platformShareBps?: number | null): AgentRevenueSplit {
  const grossMicro = toMicroUsdc(amountUsdc);
  const agentBps = safeShareBps(agentShareBps, defaultAgentShareBps);
  const platformBps = safeShareBps(platformShareBps, defaultPlatformShareBps);
  const denominator = BigInt(agentBps + platformBps || 10_000);
  const agentShareMicro = denominator > 0n ? (grossMicro * BigInt(agentBps)) / denominator : 0n;
  const platformShareMicro = grossMicro - agentShareMicro;

  return {
    grossAmountUsdc: formatMicroUsdc(grossMicro),
    agentShareUsdc: formatMicroUsdc(agentShareMicro),
    platformShareUsdc: formatMicroUsdc(platformShareMicro),
  };
}

function normalizedWallet(address: string) {
  return getAddress(address).toLowerCase();
}

export async function recordAgentRevenueEvent(input: {
  agentId: number;
  sourceType: RevenueEventSourceType;
  sourceId: number;
  unlockerWallet: string;
  amountUsdc: string | number;
  txHash?: string | null | undefined;
}) {
  const db = createDb();
  const config = await db.query.agentConfigs.findFirst({ where: eq(agentConfigs.agentId, input.agentId) }).catch(() => null);
  const split = splitRevenueUsdc(input.amountUsdc, config?.agentShareBps, config?.platformShareBps);

  await db.insert(agentRevenueEvents).values({
    agentId: input.agentId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    unlockerWallet: normalizedWallet(input.unlockerWallet),
    grossAmountUsdc: split.grossAmountUsdc,
    agentShareUsdc: split.agentShareUsdc,
    platformShareUsdc: split.platformShareUsdc,
    txHash: input.txHash || null,
    status: "accrued",
  }).onConflictDoNothing();

  return split;
}
