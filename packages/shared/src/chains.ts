import type { Chain } from "viem";

export const ARC_TESTNET_CHAIN_ID = 5_042_002;
const ARC_TESTNET_PUBLIC_RPC = "https://rpc.testnet.arc.network";

export const arcTestnet = {
  id: ARC_TESTNET_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_ARC_RPC_URL || process.env.ARC_RPC_URL || process.env.ARC_TESTNET_RPC_URL || ARC_TESTNET_PUBLIC_RPC] },
    public: { http: [process.env.NEXT_PUBLIC_ARC_RPC_URL || process.env.ARC_RPC_URL || process.env.ARC_TESTNET_RPC_URL || ARC_TESTNET_PUBLIC_RPC] },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
} as const satisfies Chain;

export const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000" as const;

export function arcTxUrl(hash: string): string {
  return `${arcTestnet.blockExplorers.default.url}/tx/${hash}`;
}

export function arcAddressUrl(address: string): string {
  return `${arcTestnet.blockExplorers.default.url}/address/${address}`;
}
