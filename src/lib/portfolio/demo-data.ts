/**
 * The demo portfolio is defined as *quantities held*, not USD values.
 *
 * This matters: USD values and allocation percentages are computed at request
 * time from live FTSOv2 feeds, so the 60% XRP exposure the agent reacts to is
 * an oracle-derived figure rather than a constant. The quantities below are
 * sized to produce roughly a 60/30/10 split at prevailing prices.
 */
export interface DemoHolding {
  symbol: string;
  name: string;
  quantity: number;
}

export const DEMO_HOLDINGS: DemoHolding[] = [
  { symbol: 'XRP', name: 'Ripple', quantity: 3000 },
  { symbol: 'FXRP', name: 'Flare XRP', quantity: 1500 },
  { symbol: 'C2FLR', name: 'Coston2 Flare', quantity: 83_333 },
];
