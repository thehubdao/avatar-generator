import './../styles/globals.css'
import { Work_Sans, Poppins } from '@next/font/google'
import Humane from '@next/font/local'
import MonumentFont from '@next/font/local'
import FeaturesIcons from '@next/font/local'
import { AppProps } from 'next/app'
import { PrivyAuthProvider } from '../components/providers/PrivyProvider'
import "toastify-js/src/toastify.css"
import { Provider } from 'react-redux'
import citizensStore from '../store/store'

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
            <Provider store={citizensStore}>
                <PrivyAuthProvider>
                    <Component {...pageProps} />
                </PrivyAuthProvider>
            </Provider>
        </>
    )
}
