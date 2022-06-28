import Head from 'next/head'
import styles from './../styles/home.module.scss'
import {Component} from "react";
import Link from "next/link";

export default class Home extends Component {  
  render() {
    return (
      <div className={styles.container}>
        <Head>
          <title>Avatar Generator</title>
          <meta name="description" content="Avatar Generator"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>

        <main className="text-gray-700 font-bold justify-center">
          <h1 className={styles.title}>
            Welcome
          </h1>
          <Link href={'/example'}>Go To Example</Link>
        </main>
      </div>
    );
  }
}
