import { UserInterface } from "../../../../interfaces/firebase.interface";
import UserCardUI from "./UserCard.ui";

//** Represents the props for the UserList component.
interface UserListProps {
  userList: UserInterface[];
}

/**
 ** Represents the UserList component.
 * @param {UserListProps} userList - The list of users to display.
 * 
 * TODO: Loadgin component when userList is Loading.
 */
export default function UserListUI({ userList }: UserListProps) {
  return (
    <>
      <h1 className="mt-10 font-humane text-9xl">USER LIST:</h1>
      <div className="flex flex-wrap gap-5">
        {/* Renders a UserCard component for each user in the userList array. */}
        {userList?.map((user, index) => <UserCardUI key={index} user={user} />)}
      </div>
    </>
  );
}
