import {LogOut} from "../../utils/firebase.util";

import AGButton from "../common/ag-button.component";

import { IoMdLogOut } from 'react-icons/io';

export default function Header() {
  return (
    <div className="fixed w-full flex justify-end p-5">
      <AGButton nm >
        Account
      </AGButton>
      <AGButton nm fit onClickEvent={() => void LogOut()}>
        <IoMdLogOut />
      </AGButton>
    </div>
  )
}