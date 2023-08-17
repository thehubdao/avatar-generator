import { useAppSelector } from "../../../store/hooks";
import { AuthStateInterface } from "../../../interfaces/common.interface";
import { PageLocation } from "../../../enums/common.enum";
import AGButton from "../../common/ag-button.component";
import { GoToPage } from "../../../utils/router.util";
import { UserRoleValues } from "../../../enums/firebase.enum";

//** Represents the admin account component.
export default function AdminAccountUI() {
  //** Retrieves the user data from the app state.
  const userData: AuthStateInterface = useAppSelector(state => state.auth);

  return (
    <>
      <h1 className="font-humane text-9xl text-gray-normal">ACCOUNT:</h1>

      <div className="mt-10">
        <p className="font-poppins font-bold text-3xl text-gray-normal mb-4">
          {/* Displays the user name or 'User' if it's undefined. */}
          {userData.userInfo?.name ?? 'Not User Data'}
          {/* Displays the user address if available. */}
          {userData.address && <span className="ml-6">({userData.address})</span>}
        </p>

        {userData.userInfo && (
          <div className="text-base text-gray-normal">
            <p><b>Rol:</b> {UserRoleValues[userData.userInfo.role]}</p>
            <p><b>Account:</b> {userData.userInfo.account}</p>
            <p><b>Email:</b> {userData.userInfo.email}</p>
          </div>
        )}

        {/* Renders a button for users with role 0, which navigates to the User Control page on click. */}
        {userData.userInfo?.role === 0 && (
          <AGButton nm onClickEvent={() => { void GoToPage(PageLocation.UserControl) }}>
            <p className="m-2">Users Control</p>
          </AGButton>
        )}
      </div>
    </>
  );
}
