import { FutureverseAuthClient } from '@futureverse/auth-react/auth';
import { FutureverseAuthProvider } from '@futureverse/auth-react';
import { createWagmiConfig } from '@futureverse/wagmi-connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cookieStorage, createStorage } from 'wagmi';
import { AuthUiProvider } from '@futureverse/auth-ui';
import { root, rootPorcini } from "viem/chains";
import { CLIENT_ID, CUSTOM_THEME_CONFIG } from '../../constants/root/pass.constant';
import { CHAIN_ID, DOMAIN, ORIGIN } from '../../constants/root/contract.constant';

export default function FutureVerseProvider({ children }: { children: React.ReactNode }) {

    const authClient = new FutureverseAuthClient({
        clientId: CLIENT_ID,
        redirectUri: ORIGIN,
        signInFlow: 'redirect',
        hostWeb3SigningDomain: DOMAIN, // Add this required property
        chainId: Number(CHAIN_ID)
    });
    const queryClient = new QueryClient();

    const wagmiConfig = createWagmiConfig({
        chains: [root, rootPorcini],
        authClient,

/* Type '{ key: string; getItem: <key extends keyof StorageItemMap, value extends StorageItemMap[key], defaultValue extends value | null | undefined>(key: key, defaultValue?: defaultValue | undefined) => (defaultValue extends null ? value | null : value) | Promise<...>; setItem: <key extends keyof StorageItemMap, value exten...' is not assignable to type 'Storage'.
Types of property 'getItem' are incompatible.
Type '<key extends keyof StorageItemMap, value extends StorageItemMap[key], defaultValue extends value | null | undefined>(key: key, defaultValue?: defaultValue | undefined) => (defaultValue extends null ? value | null : value) | Promise<...>' is not assignable to type '<key extends string, value extends (StorageItemMap & Record<string, unknown>)[key], defaultValue extends value | null | undefined>(key: key, defaultValue?: defaultValue | undefined) => (defaultValue extends null ? value | null : value) | Promise<...>'.
  Types of parameters 'key' and 'key' are incompatible.
    Type 'key' is not assignable to type 'keyof StorageItemMap'.
      Type 'string' is not assignable to type 'keyof StorageItemMap'.ts(2322)
createWagmiConfig.d.ts(20, 5): The expected type comes from property 'storage' which is declared here on type 'IConfigProps'  */
/* → */storage: createStorage({
            storage: cookieStorage,
        }),
        metamaskDappMetadata: {
            name: "The Hub Portal",
            url: ORIGIN,
        },
    });


    return (
        <QueryClientProvider client={queryClient}>
            <FutureverseAuthProvider authClient={authClient}>
{/* Type 'Config<readonly [Chain, ...Chain[]], { [key: number]: HttpTransport; }, (CreateConnectorFn<EthereumProvider, { connect(parameters?: { chainId?: number | undefined; isReconnecting?: boolean | undefined; pairingTopic?: string | undefined; } | undefined): Promise<...>; ... 7 more ...; requestedChainsStorageKey: `${stri...' is not assignable to type 'Config'.
  Types of property '_internal' are incompatible.
    Property 'revalidate' is missing in type 'Internal<readonly [Chain, ...Chain[]], { [key: number]: HttpTransport; }>' but required in type 'Internal<readonly [Chain, ...Chain[]], Record<number, Transport<string, Record<string, any>, EIP1193RequestFn>>>'.ts(2322)
createConfig.d.ts(50, 5): 'revalidate' is declared here.
WagmiProvider.d.ts(5, 5): The expected type comes from property 'wagmiConfig' which is declared here on type 'IntrinsicAttributes & AuthUiProviderProps & WagmiProviderProps & { children?: ReactNode; }'
Windsurf: Explain Problem
(property) wagmiConfig: Config */}
               {/* → */} <AuthUiProvider themeConfig={CUSTOM_THEME_CONFIG} authClient={authClient} wagmiConfig={wagmiConfig}>
                    {children}
                </AuthUiProvider>
            </FutureverseAuthProvider>
        </QueryClientProvider>
    )
}