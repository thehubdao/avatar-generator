import Head from "next/head";
import Layout from "../../../ui/admin/admin.layout";
import AdminAccount from "../../../ui/admin/account/account.ui";

export default function AccountView() {

  return (
    <>
      <Head>
        <title>Admin Account</title>
      </Head>
      <Layout>
        <AdminAccount />
      </Layout>
    </>
  )
}