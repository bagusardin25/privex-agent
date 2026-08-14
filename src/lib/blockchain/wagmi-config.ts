import { createConfig, http, injected } from 'wagmi';
import { flareTestnet } from './config';

/**
 * wagmi configuration for the Private AI Financial Agent.
 *
 * Only the injected connector is used: the agent is non-custodial, so every
 * write goes through the user's own wallet (MetaMask, Rabby, Brave, ...).
 * No WalletConnect project id is required, which keeps the demo dependency-free.
 */
export const wagmiConfig = createConfig({
  chains: [flareTestnet],
  connectors: [injected()],
  transports: {
    [flareTestnet.id]: http(
      process.env.NEXT_PUBLIC_FLARE_TESTNET_RPC || flareTestnet.rpcUrls.default.http[0]
    ),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
