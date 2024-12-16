import { PrivyProvider } from '@privy-io/react-auth';

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        "appearance": {
          "accentColor": "#A7C080",
          "theme": "#222224",
          "walletList": [
            "detected_ethereum_wallets"
          ]
        },
        "loginMethods": [
          "wallet"
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
