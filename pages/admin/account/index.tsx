import Head from "next/head";
import Layout from "../../../ui/admin/admin.layout";
import AGLoading from "../../../ui/common/ag-loading.component";
import AdminAccount from "../../../ui/admin/admin.account";


export default function AccountView() {

  return (
    <>
      <Head>
        <title>Admin Account</title>
      </Head>
      <Layout>
        <AdminAccount />
      </Layout>
      <AGLoading loading={false} bgColor="F1F5F9" />
    </>
  )
}