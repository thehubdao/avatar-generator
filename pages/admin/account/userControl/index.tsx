import Head from "next/head";
import Layout from "../../../../ui/admin/admin.layout";
import UserControlComponent from "../../../../components/admin/account/userControl/userControl.component";

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
