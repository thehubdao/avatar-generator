import './../styles/globals.css';
import { Work_Sans } from '@next/font/google';
import Humane from '@next/font/local';
import {AppProps} from "next/app";

const workSans = Work_Sans({ subsets: ['latin'] });
const humane = Humane({ src: '../styles/fonts/Humane-Medium.woff2' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
          :root {
            --work-font: ${workSans.style.fontFamily};
            --humane-font: ${humane.style.fontFamily};
          }
        `}</style>
      <Component {...pageProps} />
    </>
  )
}

