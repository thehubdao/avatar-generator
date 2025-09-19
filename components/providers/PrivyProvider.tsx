import { PrivyProvider } from '@privy-io/react-auth';
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        "appearance": {
          "accentColor": "#A7C080",
          "theme": "#222224",
          "walletList": [
          "universal_profile", "phantom", "detected_solana_wallets", "metamask"
          ],
          walletChainType:'ethereum-and-solana'
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },},
        "loginMethods": [
          "wallet"
        ],
        "supportedChains": [
          {
            "name": "Solana",
            "id": 901,
            "nativeCurrency": {
              "name": "Solana",
              "symbol": "SOL",
              "decimals": 9
            },

            rpcUrls: {
              default: {
                http: ["https://api.devnet.solana.com"],
                webSocket: undefined
              }
            }
          },
          {"name":"Polygon", "id":137, "nativeCurrency": {
            "name": "Polygon",
            "symbol": "MATIC",
            "decimals": 18
          },
          rpcUrls: {
            default: {
              http: ["https://rpc-amoy.polygon.technology/"],
              webSocket: undefined
            }
          }
        }
        ],
        
      }}
    >
      {children}
    </PrivyProvider>
  );
}