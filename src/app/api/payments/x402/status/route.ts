import { NextResponse } from "next/server";
import { X402_CONFIG, isX402Configured, getNetworkDisplayName } from "@/lib/x402";

// GET: Check x402 configuration status
export async function GET() {
  const configured = isX402Configured();

  return NextResponse.json({
    enabled: X402_CONFIG.enabled,
    configured,
    network: X402_CONFIG.network,
    networkDisplayName: getNetworkDisplayName(),
    payToAddress: configured ? X402_CONFIG.payToAddress : null,
    // Don't expose CDP keys
  });
}
