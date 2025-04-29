import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { FutureverseAuthProvider, FutureverseWagmiProvider } from '@futureverse/auth-react';
import { createWagmiConfig } from '@futureverse/auth-react/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { AuthUiProvider, DefaultTheme, ThemeConfig } from '@futureverse/auth-ui'

const customThemeConfig: ThemeConfig = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        page: '', // The whole page background color
        surface: '#000000',
        muted: 'rgba(1, 1, 1, 1)',
    },
    borderRadius: {
        ...DefaultTheme.borderRadius,
        default: 10,
    },
    showCloseButton: true,
    
};

const clientId = '_I8ed6ePWVvtBg-Hu6yeW';


const authClient = new FutureverseAuthClient({
    clientId,
    environment: 'staging',
    redirectUri: 'http://localhost:3000',
    signInFlow: 'popup',
});
const queryClient = new QueryClient();

export const getWagmiConfig = async () => {
    return createWagmiConfig({
        authClient,
        storage: createStorage({
            storage: cookieStorage,
        }),
    });
};

export default function FutureVerseProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <FutureverseWagmiProvider getWagmiConfig={getWagmiConfig}>
                    <FutureverseAuthProvider authClient={authClient}>
                        <AuthUiProvider themeConfig={customThemeConfig} authClient={authClient}>
                            {children}
                        </AuthUiProvider>
                    </FutureverseAuthProvider>
                </FutureverseWagmiProvider>
            </QueryClientProvider>

        </>
    )
}
