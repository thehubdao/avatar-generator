import { useAppSelector } from "../../../store/hooks";
import { AuthStateInterface } from "../../../interfaces/common.interface";
import { PageLocation, UserRol } from "../../../enums/common.enum";
import AGButton from "../../common/ag-button.component";
import { GoToPage } from "../../../utils/router.util";

export default function AdminAccount() {
  const userData: AuthStateInterface = useAppSelector(state => state.auth)

  return (
    <>
      <h1 className="font-humane text-9xl text-gray-normal">ACCOUNT:</h1>

      <div className="mt-10">
        <p className="font-poppins font-bold text-3xl text-gray-normal mb-4">
          {userData.userInfo?.name ?? 'User'}
          {userData.address && <span className="ml-6">({userData.address})</span>}
        </p>
        {userData.userInfo && <div className="text-base text-gray-normal">
          <p><b>Rol:</b> {UserRol[userData.userInfo.role ?? 1]}</p>
          <p><b>Account:</b> {userData.userInfo.account}</p>
          <p><b>Email:</b> {userData.userInfo.email}</p>
        </div>}

        {userData.userInfo?.role === 0 && <AGButton nm onClickEvent={() => { GoToPage(PageLocation.UserControl) }}>
          <p className="m-2">
            Users Control
          </p>
        </AGButton>}
      </div>
    </>
  )
}