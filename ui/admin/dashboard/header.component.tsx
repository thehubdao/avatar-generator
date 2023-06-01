import {LogOut} from "../../../utils/firebase.util";

import AGButton from "../../common/ag-button.component";

import { IoMdLogOut, IoMdArrowBack } from 'react-icons/io';
import { useState } from "react";

interface HeaderProps {
  backBtn: boolean;
  backClickHandler: () => void;
}

export default function Header({backBtn, backClickHandler}: HeaderProps) {
  const [showModal, setShowModal] = useState<boolean>(false);

  function Modal () {
    return (
      <div className="bg-gray-dark w-80 p-6 rounded-2xl">
        <div className="flex items-center pb-4 gap-4">
          <div className="bg-white rounded-full w-10 h-10 text-2xl flex justify-center items-center">
            <IoMdLogOut />
          </div>
          <p className="text-white">Are you sure you want to<br/>log out?</p>
        </div>
        <div className="flex w-full justify-end">
          <AGButton fit onClickEvent={() => void setShowModal(false)}>
            NO
          </AGButton>
          <AGButton fit onClickEvent={() => void LogOut()}>
            YES
          </AGButton>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed w-full flex justify-between p-5 top-0 left-0 bg-bg">
      {
        backBtn &&
        <div className="flex">
          <AGButton nm fit onClickEvent={() => void backClickHandler()}>
            <IoMdArrowBack />
          </AGButton>
        </div>
      }
      <div></div>
      <div className="flex">
        <AGButton nm >
          Account
        </AGButton>
        <div className="relative">
          <AGButton nm fit onClickEvent={() => void setShowModal(true)}>
            <IoMdLogOut />
          </AGButton>
          {
            showModal && 
            <div className="absolute top-full right-0">
              <Modal />
            </div>
          }
        </div>
      </div>
    </div>
  )
}