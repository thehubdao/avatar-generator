import './../styles/globals.css'
import { Work_Sans, Poppins } from '@next/font/google'
import Humane from '@next/font/local'
import MonumentFont from '@next/font/local'
import FeaturesIcons from '@next/font/local'
import { AppProps } from 'next/app'
import { PrivyAuthProvider } from '../components/providers/PrivyProvider'
import "toastify-js/src/toastify.css"
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
      muted: 'rgba(1, 1, 1, 1)',
    },
     borderRadius: {
      ...DefaultTheme.borderRadius,
      default: 10,
    },
  };

const clientId = 'zjHdKav0hVGFETJBwiOv2';


const authClient = new FutureverseAuthClient({
    clientId,
    environment: 'development',
    redirectUri: 'http://localhost:3000/fp',
    signInFlow: 'popup',
    /** Custom IDP url goes under authority */
    authority: 'https://jen.passonline.cloud',
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


const workSans = Work_Sans({ subsets: ['latin'], display: 'block' })
const poppins = Poppins({
    subsets: ['latin'],
    display: 'block',
    weight: ['400', '500', '600', '700'],
})
const humane = Humane({
    src: '../styles/fonts/Humane-Medium.woff2',
    display: 'block',
})
const monument = MonumentFont({
    src: '../styles/fonts/MonumentExtended-Ultrabold.woff2',
    display: 'block',
})
const featuresIcons = FeaturesIcons({
    src: '../public/resources/icons/fontsets/icomoon.woff',
    display: 'block',
})

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <style jsx global>{`
                :root {
                    --work-font: ${workSans.style.fontFamily};
                    --humane-font: ${humane.style.fontFamily};
                    --monument-font: ${monument.style.fontFamily};
                    --poppins-font: ${poppins.style.fontFamily};
                    --features-icons-font: ${featuresIcons.style.fontFamily};
                }
            `}</style>
            <QueryClientProvider client={queryClient}>
                <FutureverseWagmiProvider getWagmiConfig={getWagmiConfig}>
                    <FutureverseAuthProvider authClient={authClient}>
                        <AuthUiProvider themeConfig={customThemeConfig} authClient={authClient}>
                            <PrivyAuthProvider>
                                <Component {...pageProps} />
                            </PrivyAuthProvider>
                        </AuthUiProvider>
                    </FutureverseAuthProvider>
                </FutureverseWagmiProvider>
            </QueryClientProvider>
        </>
    )
}
