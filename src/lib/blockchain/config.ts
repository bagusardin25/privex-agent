import { defineChain } from 'viem';

export const flareTestnet = defineChain({
  id: 114,
  name: 'Flare Testnet Coston2',
  nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: { default: { http: ['https://coston2-api.flare.network/ext/C/rpc'], webSocket: ['wss://coston2-api.flare.network/ext/C/ws'] } },
  blockExplorers: { default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' } },
  testnet: true,
});

export const FLARE_CONTRACT_REGISTRY = '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019';
export const FTSO_V2_ADDRESS = '0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d';
