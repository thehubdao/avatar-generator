import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { FutureverseAuthProvider, FutureverseWagmiProvider } from '@futureverse/auth-react';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { AuthUiProvider } from '@futureverse/auth-ui';
import { CLIENT_ID, CUSTOM_THEME_CONFIG, ENVIRONMENT } from '../../constants/root/pass.constant';

export default function FutureVerseProvider({ children }: { children: React.ReactNode }) {

    const authClient = new FutureverseAuthClient({
        clientId: '6bi7-Yv3hZLisXjs8N6Zh',
        environment: 'production',
        redirectUri: 'https://avatar-generator-git-pr-root-marketplace-dap-frontend.vercel.app/citizens',
        signInFlow: 'redirect',
    });
    const queryClient = new QueryClient();

    const getWagmiConfig = async () => {
        return createWagmiConfig({
            authClient,
            storage: createStorage({
                storage: cookieStorage,
            }),
        });
    };

    return (
        <QueryClientProvider client={queryClient}>
            <FutureverseWagmiProvider getWagmiConfig={getWagmiConfig}>
                <FutureverseAuthProvider authClient={authClient}>
                    <AuthUiProvider themeConfig={CUSTOM_THEME_CONFIG} authClient={authClient}>
                        {children}
                    </AuthUiProvider>
                </FutureverseAuthProvider>
            </FutureverseWagmiProvider>
        </QueryClientProvider>
    )
}