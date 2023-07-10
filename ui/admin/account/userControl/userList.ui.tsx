import { UserRol } from "../../../../enums/common.enum";
import { UserInterface } from "../../../../interfaces/firebase.interface";

//** Represents the props for the UserList component.
interface UserListProps {
  userList: UserInterface[];
}

/**
 ** Represents a user card component.
 * @param {UserInterface} user - The user object to display.
 */
const UserCard = ({ user }: { user: UserInterface }) => {
  return (
    <div className="nm-flat-bg w-72 p-5 rounded-xl whitespace-nowrap">
      <p className="truncate"><b>Name:</b> {user.name}</p>
      <p className="truncate"><b>Account:</b> {user.account}</p>
      <p className="truncate"><b>Email:</b> {user.email}</p>
      <div className="truncate">
        <p><b>Campaings:</b></p>
        <div className="overflow-x-auto flex gap-3">
          {user.campaign && user.campaign.map((item, index) => {
            return <p className="" key={index}>| {item} |</p>
          })}
        </div>
      </div>
      <p className="truncate"><b>Role:</b> {UserRol[user.role ?? 1]} ({user.role})</p>
    </div>
  );
};

/**
 ** Represents the UserList component.
 * @param {UserListProps} userList - The list of users to display.
 * 
 * TODO: Loadgin component when userList is Loading.
 */
export default function UserList({ userList }: UserListProps) {
  return (
    <>
      <h1 className="mt-10 font-humane text-9xl">USER LIST:</h1>
      <div className="flex flex-wrap gap-5">
        {/* Renders a UserCard component for each user in the userList array. */}
        {userList?.map((user, index) => <UserCard key={index} user={user} />)}
      </div>
    </>
  );
}
