import {Component} from "react";
import Layout from "../../components/admin/_layout.component";
import {GetStaticProps} from "next";

interface AdminProps {
}

interface AdminState {
}

export default class Admin extends Component<AdminProps, AdminState> {
  render() {
    return (
      <>
        <Layout>
          <h1>Hello World!</h1>
        </Layout>
      </>
    );
  }
}

export const getStaticProps: GetStaticProps<AdminProps> = async (context) => {
  return {
    notFound: true,
  };
}
