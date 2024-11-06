import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/router';

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
      onSuccess={() => router.push('/')}
    >
      {children}
    </PrivyProvider>
  );
}
