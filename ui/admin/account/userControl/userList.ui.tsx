import { UserRol } from "../../../../enums/common.enum";
import { UserInterface } from "../../../../interfaces/firebase.interface";

interface UserListProps {
  userList: UserInterface[]
}

const UserCard = ({ user }: { user: UserInterface }) => {
  return (
    <div className="nm-flat-bg w-72 p-5 rounded-xl whitespace-nowrap">
      <p className="truncate"><b>Name:</b> {user.name}</p>
      <p className="truncate"><b>Account:</b> {user.account}</p>
      <p className="truncate"><b>Email:</b> {user.email}</p>
      <p className="truncate"><b>Role:</b> {UserRol[user.role ?? 1]} ({user.role})</p>
    </div>
  )
}

export default function UserList({ userList }: UserListProps) {

  return (
    <>
      <h1 className="mt-10 font-humane text-9xl">USER LIST:</h1>
      <div className="flex flex-wrap gap-5">
        {userList?.map((user, index) => <UserCard key={index} user={user} />)}
      </div>
    </>
  )
}