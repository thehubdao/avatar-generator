import { useAppSelector } from "../../store/hooks";
import { AuthStateInterface } from "../../interfaces/common.interface";
import { UserRol } from "../../enums/common.enum";

export default function AdminAccount() {
  const userData: AuthStateInterface = useAppSelector(state => state.auth)

  console.log({ userData })

  return (
    <>
      <h1 className="font-humane text-9xl text-gray-normal">ACCOUNT:</h1>


      <div className="mt-10">
        <p className="font-humane text-6xl text-gray-dark tracking-wide">
          Name: {userData.userInfo?.name ?? 'User'}
          {userData.address && <span className="ml-6">#{userData.address}</span>}
        </p>
        {userData.userInfo && <div>
          <p className="font-humane text-5xl text-gray-normal tracking-wide">Role: {UserRol[userData.userInfo.role ?? 1]}</p>
          <p className="font-humane text-5xl text-gray-normal tracking-wide">Account: {userData.userInfo.account}</p>
          <p className="font-humane text-5xl text-gray-normal tracking-wide">Email: {userData.userInfo.email}</p>
        </div>}
      </div>
    </>
  )
}