import Head from "next/head";
import UserControlComponent from "../../../../components/admin/account/userControl/userControl.component";
import Layout from "../../../../layouts/admin.layout";

//** Represents the UserControlView component for managing user control in the admin section.
export default function UserControlView() {
  return (
    <>
      <Head>
        <title>Admin User Control</title>
      </Head>
      <Layout>
        <UserControlComponent />
      </Layout>
    </>
  );
}
