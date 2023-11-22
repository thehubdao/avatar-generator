import { useEffect, useState } from "react";
import { UserInterface, UserWithPass } from "../../../../interfaces/firebase.interface";
import { CreateNewUser, GetUserList } from "../../../../utils/firebase.util";
import { AuthValues, UserRoleValues } from "../../../../enums/firebase.enum";
import { ShowModal } from "../../../../utils/modal.util";
import { IsEmail, LogError } from "../../../../utils/common.util";
import { EmailResult, Module, PageLocation } from "../../../../enums/common.enum";
import UserControlUI from "../../../../ui/admin/account/userControl/userControl.ui";
import { AuthStateInterface } from "../../../../interfaces/common.interface";
import { useAppSelector } from "../../../../store/hooks";
import { GoToPage } from "../../../../utils/router.util";

export default function UserControlComponent() {
  const userData: AuthStateInterface = useAppSelector(state => state.auth);
  const [userList, setUserList] = useState<UserInterface[]>();

  useEffect(() => {
    if (userData.userInfo?.role !== 0) void GoToPage(PageLocation.Account);

    const componentDidMount = async () => {
      await getUserListData();
    };

    componentDidMount().catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //** Retrieves the user list data from Firebase.
  async function getUserListData() {
    const userData = await GetUserList();
    setUserList(userData.success ? userData.value : []);
  }

  /**
   ** Handles the creation of a new user.
   * @param {string} userAccount - The user account input.
   * @param {string} userName - The user name input.
   * @param {string} userPass - The user password input.
   */
  async function handleCreateNewUser(
    userAccount: string,
    userName: string,
    userPass: string
  ) {
    const newEmail = userEmail(userAccount);
    if (newEmail == undefined) return;

    const newUser: Partial<UserWithPass> = {
      account: userAccount,
      email: newEmail,
      name: userName,
      password: userPass,
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

  return (<UserControlUI userList={userList ?? []} handleCreateNewUser={handleCreateNewUser} />)
}