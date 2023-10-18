import {getDefaultWallets} from "@rainbow-me/rainbowkit";
import {configureChains, createConfig} from "wagmi";
import {
  mainnet,
  polygon
} from "wagmi/chains";
import {publicProvider} from "wagmi/providers/public";
import {Raise} from "../common.util";
// import {alchemyProvider} from "wagmi/providers/alchemy";

export function GetWagmiConfig() {
  const walletConnectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID ?? Raise("Missing WalletConnectId!");

  const {chains, publicClient} = configureChains(
    [
      mainnet,
      polygon,
      // optimism,
      // arbitrum,
      // base,
      // zora
    ],
    [
      // alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
      publicProvider()
    ]
  );

  const {connectors} = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: walletConnectId,
    chains
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  });

  return {chains, wagmiConfig};
}