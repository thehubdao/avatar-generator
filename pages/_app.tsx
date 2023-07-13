import './../styles/globals.css';
import { Work_Sans, Poppins } from '@next/font/google';
import Humane from '@next/font/local';
import FeaturesIcons from '@next/font/local';
import {AppProps} from "next/app";

const workSans = Work_Sans({ subsets: ['latin'], display: 'block' });
const poppins = Poppins({ subsets: ['latin'], display: 'block', weight: ['400', '500','600','700'] });
const humane = Humane({ src: '../styles/fonts/Humane-Medium.woff2', display: 'block' });
const featuresIcons = FeaturesIcons({ src: '../public/resources/icons/fontsets/icomoon.woff', display: 'block' });

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
      <Component {...pageProps} />
    </>
  )
}

