import './../styles/globals.css'
import { Work_Sans, Poppins } from '@next/font/google'
import Humane from '@next/font/local'
import FeaturesIcons from '@next/font/local'
import { AppProps } from 'next/app'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import luksoModule from '@lukso/web3-onboard-config'
import { ConnectModalOptions } from '@web3-onboard/core/dist/types'
import { I18nOptions } from '../types/web3onboard.type'

const luksoProvider = luksoModule()

const UP_BROWSER_EXTENSION_URL =
    'https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl'

const luksoNetwork = {
    id: '0x42010001',
    token: 'LYXt',
    label: 'Lukso Testnet',
    rpcUrl: 'https://rpc.testnet.lukso.network',
}

const chains = [luksoNetwork]

 const appInfo = {
    name: 'Avatar Lukso',
    icon: '/resources/images/the-hub-logo-web.svg',
    logo: '/resources/images/the-hub-logo-web.svg',
    description: 'LUKSO CITIZENS',
    recommendedInjectedWallets: [
        {
            name: 'Universal Profiles',
            url: UP_BROWSER_EXTENSION_URL,
        },
    ],

} 

const connectionOptions: ConnectModalOptions = {
    iDontHaveAWalletLink: UP_BROWSER_EXTENSION_URL,
    removeWhereIsMyWalletWarning: true,
}

const i18n: I18nOptions = {
    en: {
        connect: {
            selectingWallet: {
                sidebar: {
                    paragraph: `Connecting your wallet is like "logging in" to Web3. If you don't have a wallet, make sure to create you Universal Profile to access the App!`,
                },
            },
        },
    },
}

const wallets = [
    injectedModule({
        custom: [luksoProvider],
        displayUnavailable: ['Universal Profiles'],
    }),
]

const web3Onboard = init({
    wallets,
    chains,
appMetadata: appInfo, 
    connect: connectionOptions,
    i18n,
    accountCenter: {
        desktop: {
          enabled: false,
          position: 'topRight'
        },
        mobile: {
          enabled: false,
          position: 'topRight'
        }
      }


})

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
                    --poppins-font: ${poppins.style.fontFamily};
                    --features-icons-font: ${featuresIcons.style.fontFamily};
                }
            `}</style>
            <Web3OnboardProvider web3Onboard={web3Onboard}>
                <Component {...pageProps} />
            </Web3OnboardProvider>
        </>
    )
}
