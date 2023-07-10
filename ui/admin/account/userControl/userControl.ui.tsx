import { MutableRefObject, useEffect } from "react";
import { UserInterface } from "../../../../interfaces/firebase.interface";
import NewUser from "./newUser.ui";
import UserList from "./userList.ui";
import { AuthStateInterface } from "../../../../interfaces/common.interface";
import { useAppSelector } from "../../../../store/hooks";
import { GoToPage } from "../../../../utils/router.util";
import { PageLocation } from "../../../../enums/common.enum";

//** Represents the props for the UserControl component.
interface UserControlProps {
  userList: UserInterface[];
  handleCreateNewUser: (
    userAccount: MutableRefObject<HTMLInputElement | null>,
    userName: MutableRefObject<HTMLInputElement | null>,
    userPass: MutableRefObject<HTMLInputElement | null>
  ) => Promise<void>;
}

/**
 ** Represents the UserControl component.
 * @param {UserControlProps} props - The props for the UserControl component.
 */
export default function UserControl({ userList, handleCreateNewUser }: UserControlProps) {
  //** Retrieves the user data from the app state.
  const userData: AuthStateInterface = useAppSelector(state => state.auth);

  useEffect(() => {
    const componentDidMount = () => {
      //** Only User Admin Control
      if (userData.userInfo?.role !== 0) { GoToPage(PageLocation.Account) }
    };

    componentDidMount()
  }, [])

  return (
    <div className="text-gray-normal">
      {/* Renders the NewUser component and passes the handleCreateNewUser function as a prop. */}
      <NewUser handleCreateNewUser={handleCreateNewUser} />

      {/* Renders the UserList component and passes the userList array as a prop. */}
      <UserList userList={userList} />
    </div>
  );
}
