import { Portfolio } from '@/types';

export const DEMO_PORTFOLIO: Portfolio = {
  totalValue: 5000,
  riskProfile: 'MEDIUM',
  lastUpdated: new Date().toISOString(),
  assets: [
    {
      symbol: 'XRP',
      name: 'Ripple',
      allocation: 0.6,
      value: 3000,
    },
    {
      symbol: 'FXRP',
      name: 'Flare XRP',
      allocation: 0.3,
      value: 1500,
    },
    {
      symbol: 'C2FLR',
      name: 'Coston2 Flare',
      allocation: 0.1,
      value: 500,
    },
  ],
};
