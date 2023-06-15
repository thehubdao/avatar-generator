import Head from "next/head"
import Layout from "../../../../ui/admin/admin.layout"
import AGLoading from "../../../../ui/common/ag-loading.component"
import CreateAssetUI from "../../../../ui/admin/campaign/createAsset/createAsset.ui"

export default function newAsset() {
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