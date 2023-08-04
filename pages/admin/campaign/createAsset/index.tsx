import Head from "next/head"
import Layout from "../../../../layouts/admin.layout"
import AGLoading from "../../../../ui/common/ag-loading.component"
import CreateAssetUI from "../../../../ui/admin/campaign/createAsset/createAsset.ui"

export default function NewAsset() {
  return (
    <>
      <Head>
        <title>Admin - new Asset</title>
      </Head>
      <Layout>
        <CreateAssetUI />
      </Layout>
      <AGLoading loading={false} bgColor="F1F5F9" />
    </>
  )
}