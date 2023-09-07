import { IoMdLogOut } from "react-icons/io";
import AGButton from "../../../common/ag-button.component";
import { LogOut } from "../../../../utils/firebase.util";
import { useAppDispatch } from "../../../../store/hooks";
import { disconnect } from "../../../../store/authSlice";

interface ModalUIProps {
  closeModal: () => void;
}

export default function ModalUI({ closeModal }: ModalUIProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="bg-gray-dark w-80 p-6 rounded-2xl">
      <div className="flex items-center pb-4 gap-4">
        <div className="bg-white rounded-full w-10 h-10 text-2xl flex justify-center items-center">
          <IoMdLogOut />
        </div>
        <p className="text-white">Are you sure you want to<br />log out?</p>
      </div>
      <div className="flex w-full justify-end">
        <AGButton fit onClickEvent={() => closeModal()}>
          NO
        </AGButton>
        <AGButton fit onClickEvent={() => {
          void dispatch(disconnect());
          void LogOut();
        }}>
          YES
        </AGButton>
      </div>
    </div>
  )
}