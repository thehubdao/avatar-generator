import { MutableRefObject } from "react";
import { UserInterface } from "../../../../interfaces/firebase.interface";
import NewUser from "./newUser.ui";
import UserList from "./userList.ui";

//** Represents the props for the UserControl component.
interface UserControlProps {
  userList: UserInterface[];
  handleCreateNewUser: (
    userAccount: MutableRefObject<HTMLInputElement | null>,
    userName: MutableRefObject<HTMLInputElement | null>,
    userPass: MutableRefObject<HTMLInputElement | null>
  ) => void;
}

/**
 ** Represents the UserControl component.
 * @param {UserControlProps} props - The props for the UserControl component.
 */
export default function UserControl({ userList, handleCreateNewUser }: UserControlProps) {
  return (
    <div className="text-gray-normal">
      {/* Renders the NewUser component and passes the handleCreateNewUser function as a prop. */}
      <NewUser handleCreateNewUser={handleCreateNewUser} />

      {/* Renders the UserList component and passes the userList array as a prop. */}
      <UserList userList={userList} />
    </div>
  );
}
