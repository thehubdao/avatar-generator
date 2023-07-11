import Head from "next/head";
import Layout from "../../../ui/admin/admin.layout";
import AGLoading from "../../../ui/common/ag-loading.component";
import AdminAccountComponent from "../../../components/admin/account/account.component";

export default function FirstSteps() {
  return (
    <>
      <Head>
        <title>Admin - Create campaign</title>
      </Head>
      <Layout>
        <AdminAccountComponent />
      </Layout>
      <AGLoading loading={false} bgColor="F1F5F9" />
    </>
  )
}