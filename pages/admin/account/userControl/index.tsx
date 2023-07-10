import Head from "next/head";
import Layout from "../../../../ui/admin/admin.layout";
import { MutableRefObject, useEffect, useState } from "react";
import { UserInterface, UserWithPass } from "../../../../interfaces/firebase.interface";
import { CreateNewUser, GetUserList } from "../../../../utils/firebase.util";
import { AuthValues, UserRoleValues } from "../../../../enums/firebase.enum";
import { ShowModal } from "../../../../utils/modal.util";
import { IsEmail, LogError } from "../../../../utils/common.util";
import { EmailResult, Module } from "../../../../enums/common.enum";
import UserControl from "../../../../ui/admin/account/userControl/userControl.ui";

//** Represents the UserControlView component for managing user control in the admin section.
export default function UserControlView() {
  const [userList, setUserList] = useState<UserInterface[]>();

  useEffect(() => {
    const componentDidMount = async () => {
      await getUserListData();
    };

    componentDidMount().catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //** Retrieves the user list data from Firebase.
  async function getUserListData() {
    const userData = await GetUserList();
    setUserList(userData ?? []);
  }

  /**
   ** Handles the creation of a new user.
   * @param {MutableRefObject<HTMLInputElement | null>} userAccount - The user account input ref object.
   * @param {MutableRefObject<HTMLInputElement | null>} userName - The user name input ref object.
   * @param {MutableRefObject<HTMLInputElement | null>} userPass - The user password input ref object.
   */
  async function handleCreateNewUser(
    userAccount: MutableRefObject<HTMLInputElement | null>,
    userName: MutableRefObject<HTMLInputElement | null>,
    userPass: MutableRefObject<HTMLInputElement | null>
  ) {
    const newEmail = userEmail(userAccount?.current?.value);
    if (newEmail == undefined) return;

    const newUser: Partial<UserWithPass> = {
      account: userAccount?.current?.value,
      email: newEmail,
      name: userName?.current?.value,
      password: userPass?.current?.value,
      role: UserRoleValues.admin,
      campaign: [],
    };

    const result = await CreateNewUser(newUser);
    if (!result.success) {
      ShowModal(result.errMessage ?? 'No message');
    } else {
      ShowModal("User created successfully!");
      await getUserListData();
    }
  }

  /**
   ** Generates a user email based on the provided account.
   * @param {string} account - The user account.
   * @returns {string | undefined} The generated user email.
   */
  function userEmail(account?: string) {
    if (account == undefined) {
      ShowModal(`Missing account!`);
      return undefined;
    }

    switch (IsEmail(account)) {
      case EmailResult.NoEmail:
        return account + AuthValues.DefaultEmail;
      case EmailResult.GoodEmail:
        return account;
      case EmailResult.BadEmail:
        ShowModal("Wrong email, please insert a valid email or account");
        return void LogError(Module.UserAdd, "Wrong email, please insert a valid email or account");
    }
  }

  return (
    <>
      <Head>
        <title>Admin User Control</title>
      </Head>
      <Layout>
        <UserControl userList={userList ?? []} handleCreateNewUser={handleCreateNewUser} />
      </Layout>
    </>
  );
}
