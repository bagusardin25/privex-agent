import { createPublicClient, http, type Address } from 'viem';
import { FLARE_CONTRACT_REGISTRY } from '@/lib/blockchain/config';

/**
 * Flare Time Series Oracle (FTSOv2) price reader.
 *
 * This is the only place the app learns what an asset is worth. Every exposure
 * percentage the risk engine checks — and therefore every threshold breach the
 * agent reports — is derived from these feeds rather than from a constant in
 * the source. The demo portfolio supplies quantities; Flare supplies the prices.
 *
 * The FtsoV2 address is not hardcoded: it is resolved at runtime through the
 * FlareContractRegistry, which is the documented way to survive Flare's
 * contract upgrades.
 */

/** FlareContractRegistry — identical address on Flare, Songbird, and Coston2. */
const CONTRACT_REGISTRY = FLARE_CONTRACT_REGISTRY as Address;

const RPC_URL =
  process.env.NEXT_PUBLIC_FLARE_TESTNET_RPC ?? 'https://coston2-api.flare.network/ext/C/rpc';

const registryAbi = [
  {
    inputs: [{ name: '_name', type: 'string' }],
    name: 'getContractAddressByName',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ftsoAbi = [
  {
    inputs: [{ name: '_feedId', type: 'bytes21' }],
    name: 'getFeedById',
    outputs: [
      { name: '_value', type: 'uint256' },
      { name: '_decimals', type: 'int8' },
      { name: '_timestamp', type: 'uint64' },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

/**
 * FTSOv2 feed IDs: 0x01 (crypto category) + ASCII feed name, right-padded to
 * 21 bytes. Several portfolio assets intentionally share a feed — FXRP is a
 * 1:1 FAsset representation of XRP, and WFLR/C2FLR track FLR.
 */
const FEED_IDS = {
  'FLR/USD': '0x01464c522f55534400000000000000000000000000',
  'XRP/USD': '0x015852502f55534400000000000000000000000000',
  'USDC/USD': '0x01555344432f555344000000000000000000000000',
  'USDT/USD': '0x01555344542f555344000000000000000000000000',
} as const;

type FeedName = keyof typeof FEED_IDS;

/** Which feed prices each supported asset. */
const ASSET_FEED: Record<string, FeedName> = {
  XRP: 'XRP/USD',
  FXRP: 'XRP/USD',
  FLR: 'FLR/USD',
  WFLR: 'FLR/USD',
  C2FLR: 'FLR/USD',
  USDC: 'USDC/USD',
  USDT: 'USDT/USD',
};

/**
 * Last-resort prices, used only when the oracle is unreachable. They exist so
 * a testnet RPC outage degrades the demo instead of breaking it — never to
 * silently stand in for a live quote. Any portfolio priced from these is
 * labelled `fallback` all the way to the UI.
 */
const FALLBACK_PRICES: Record<FeedName, number> = {
  'FLR/USD': 0.006,
  'XRP/USD': 1.0,
  'USDC/USD': 1.0,
  'USDT/USD': 1.0,
};

export interface FtsoPrices {
  /** USD price per unit, keyed by asset symbol. */
  bySymbol: Record<string, number>;
  /** `ftsov2` when every quote came from the oracle, `fallback` otherwise. */
  source: 'ftsov2' | 'fallback';
  /** Resolved FtsoV2 contract address, so the UI can point at what it read. */
  ftsoAddress?: string;
  /** Oracle voting-round timestamp (seconds), from the feed itself. */
  feedTimestamp?: number;
  /** Feeds that answered, for provenance display. */
  feeds: { name: string; price: number; decimals: number }[];
}

const client = createPublicClient({ transport: http(RPC_URL) });

/** FTSOv2 updates roughly every 1.8s; 20s of caching keeps RPC load sane. */
const CACHE_TTL_MS = 20_000;
let cache: { at: number; value: FtsoPrices } | null = null;

let ftsoAddressPromise: Promise<Address> | null = null;

function resolveFtsoAddress(): Promise<Address> {
  // The registry lookup is stable for the process lifetime, so it is resolved
  // once and reused rather than repeated on every price read.
  ftsoAddressPromise ??= client.readContract({
    address: CONTRACT_REGISTRY,
    abi: registryAbi,
    functionName: 'getContractAddressByName',
    args: ['FtsoV2'],
  }) as Promise<Address>;
  return ftsoAddressPromise;
}

function fallbackPrices(): FtsoPrices {
  const bySymbol: Record<string, number> = {};
  for (const [symbol, feed] of Object.entries(ASSET_FEED)) {
    bySymbol[symbol] = FALLBACK_PRICES[feed];
  }
  return { bySymbol, source: 'fallback', feeds: [] };
}

/**
 * Read every feed the portfolio needs. Returns fallback prices rather than
 * throwing: a pricing outage must not take down the whole analysis path.
 */
export async function getFtsoPrices(): Promise<FtsoPrices> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

  try {
    const ftsoAddress = await resolveFtsoAddress();
    const names = Object.keys(FEED_IDS) as FeedName[];

    const quotes = await Promise.all(
      names.map(async name => {
        const [value, decimals, timestamp] = (await client.readContract({
          address: ftsoAddress,
          abi: ftsoAbi,
          functionName: 'getFeedById',
          args: [FEED_IDS[name]],
        })) as [bigint, number, bigint];
        return {
          name,
          price: Number(value) / 10 ** Number(decimals),
          decimals: Number(decimals),
          timestamp: Number(timestamp),
        };
      })
    );

    const byFeed = Object.fromEntries(quotes.map(q => [q.name, q.price])) as Record<
      FeedName,
      number
    >;

    const bySymbol: Record<string, number> = {};
    for (const [symbol, feed] of Object.entries(ASSET_FEED)) {
      bySymbol[symbol] = byFeed[feed];
    }

    const value: FtsoPrices = {
      bySymbol,
      source: 'ftsov2',
      ftsoAddress,
      feedTimestamp: quotes[0]?.timestamp,
      feeds: quotes.map(({ name, price, decimals }) => ({ name, price, decimals })),
    };

    cache = { at: Date.now(), value };
    return value;
  } catch {
    // Deliberately not cached: a transient RPC failure should not pin the app
    // to fallback pricing for the next 20 seconds.
    return fallbackPrices();
  }
}
