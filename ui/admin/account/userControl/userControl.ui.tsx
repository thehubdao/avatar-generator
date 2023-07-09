import { MutableRefObject } from "react";
import { UserInterface } from "../../../../interfaces/firebase.interface";
import NewUser from "./newUser.ui";
import UserList from "./userList.ui";

interface userControlProps {
  userList: UserInterface[];
  handleCreateNewUser: (userAccount: MutableRefObject<HTMLInputElement | null>,
    userName: MutableRefObject<HTMLInputElement | null>,
    userPass: MutableRefObject<HTMLInputElement | null>) => void;
}

export default function UserControl({ userList, handleCreateNewUser }: userControlProps) {
  return (
    <div className="text-gray-normal">
      <NewUser handleCreateNewUser={handleCreateNewUser} />
      <UserList userList={userList} />
    </div>
  )
}