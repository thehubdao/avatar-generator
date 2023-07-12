import Head from "next/head";
import Layout from "../../../ui/admin/admin.layout";
import AdminAccountComponent from "../../../components/admin/account/account.component";

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