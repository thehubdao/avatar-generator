import {ReactNode} from "react";
import {WagmiConfig} from "wagmi";
import {RainbowKitProvider} from "@rainbow-me/rainbowkit";
import {GetWagmiConfig} from "../utils/web3/wagmi.util";

interface WagmiProviderProps {
  children: ReactNode;
}

export default function WagmiProvider({children}: WagmiProviderProps) {
  const {chains, wagmiConfig} = GetWagmiConfig();
  
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}