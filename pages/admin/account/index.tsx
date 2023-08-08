import Head from "next/head";
import AdminAccountComponent from "../../../components/admin/account/account.component";
import Layout from "../../../layouts/admin.layout";

export default function AccountView() {

  return (
    <>
      <Head>
        <title>Admin Account</title>
      </Head>
      <Layout>
        <AdminAccountComponent />
      </Layout>
    </>
  )
}