import { UserInterface } from "../../../../interfaces/firebase.interface";
import UserListUI from "./userList.ui";
import NewUserUI from "./newUser.ui";

//** Represents the props for the UserControl component.
interface UserControlProps {
  userList: UserInterface[];
  handleCreateNewUser: (
    userAccount: string,
    userName: string,
    userPass: string
  ) => Promise<void>;
}

/**
 ** Represents the UserControl component.
 * @param {UserControlProps} props - The props for the UserControl component.
 */
export default function UserControlUI({ userList, handleCreateNewUser }: UserControlProps) {
  //** Retrieves the user data from the app state.

  return (
    <div className="text-gray-normal">
      {/* Renders the NewUser component and passes the handleCreateNewUser function as a prop. */}
      <NewUserUI handleCreateNewUser={handleCreateNewUser} />

      {/* Renders the UserList component and passes the userList array as a prop. */}
      <UserListUI userList={userList} />
    </div>
  );
}
