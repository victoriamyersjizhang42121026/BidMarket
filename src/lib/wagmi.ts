import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

// Using a public demo projectId for development
// For production, get your own from https://cloud.walletconnect.com
export const config = getDefaultConfig({
  appName: 'ShieldedAuction',
  projectId: 'c0c6d2e5e8e5b3b5e8e5b3b5e8e5b3b5', // Demo projectId
  chains: [mainnet, sepolia],
  ssr: false,
});
