'use client';
import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { FutureverseAuthProvider } from '@futureverse/auth-react';
import { createWagmiConfig } from '@futureverse/wagmi-connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { AuthUiProvider } from '@futureverse/auth-ui';
import { root, rootPorcini } from "viem/chains";
import { CLIENT_ID, CUSTOM_THEME_CONFIG } from '../../constants/root/pass.constant';
import { AUTH_URL, CHAIN_ID, DOMAIN, ORIGIN } from '../../constants/root/contract.constant';


const authClient = new FutureverseAuthClient({
    clientId: CLIENT_ID,
    redirectUri: ORIGIN,
    signInFlow: 'redirect',
    hostWeb3SigningDomain: DOMAIN,
    chainId: Number(CHAIN_ID),
    authorizationURL: AUTH_URL
});
const queryClient = new QueryClient();

const wagmiConfig = createWagmiConfig({
    chains: [root, rootPorcini],
    authClient,
    storage: createStorage({
        storage: cookieStorage,
    }),
    metamaskDappMetadata: {
        name: "The Hub Portal",
        url: ORIGIN,
    },
});

export default function FutureVerseProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthUiProvider themeConfig={CUSTOM_THEME_CONFIG} authClient={authClient} wagmiConfig={wagmiConfig}>
                <FutureverseAuthProvider authClient={authClient}>
                    {children}
                </FutureverseAuthProvider>
            </AuthUiProvider>
        </QueryClientProvider>
    );
}