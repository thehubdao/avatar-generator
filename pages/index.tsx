import Head from 'next/head'
import styles from './../styles/home.module.scss'
import {Component} from "react";
import Link from "next/link";
import AGLoading from "../components/AG-Loading";
import AGButton from "../components/AG-Button";

interface HomeState {
  loading: boolean;
}

export default class Home extends Component<undefined, HomeState> {
  constructor(props: undefined) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  
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
          <AGButton type="danger" side="start" onClickEvent={() => this.setState({loading: !this.state.loading})} >Loading...?</AGButton>
          <AGLoading loading={this.state.loading}/>
        </main>
      </div>
    );
  }
}
