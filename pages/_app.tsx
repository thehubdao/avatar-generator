import './../styles/globals.css'
import { Work_Sans, Poppins } from '@next/font/google'
import Humane from '@next/font/local'
import FeaturesIcons from '@next/font/local'
import { AppProps } from 'next/app'
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'

const luksoNetwork = {
    id: '0x42010001',
    token: 'LYXt',
    label: 'Lukso Testnet',
    rpcUrl: 'https://rpc.testnet.lukso.network',
}

const chains = [luksoNetwork]

const wallets = [injectedModule()]

const web3Onboard = init({
    wallets,
    chains,
    appMetadata: {
        name: 'Avatar Lukso',
        icon: '<svg>My App Icon</svg>',
        description: 'A demo of Web3-Onboard.',
    },
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
