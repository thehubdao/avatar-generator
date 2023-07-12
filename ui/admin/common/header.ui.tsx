import {LogOut} from "../../../utils/firebase.util";

import AGButton from "../../common/ag-button.component";

import { IoMdLogOut, IoMdArrowBack } from 'react-icons/io';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "../../../store/hooks";
import { PageLocation } from "../../../enums/common.enum";
import { GoToPage } from "../../../utils/router.util";

export default function Header() {
  const currentCampaign = useAppSelector(state => state.currentCampaign.name);
  const [backBtn, setBackBtn] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if(router.pathname !== PageLocation.Admin) {
      setBackBtn(true);
      if (router.pathname !== PageLocation.FirstSteps && currentCampaign === '') {
        void GoToPage(PageLocation.Admin);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
 
  useEffect(() => {
    const handleRouteChange = () => {
      if (router.pathname !== PageLocation.Admin) setBackBtn(true);
    }
 
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

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
    <div className="fixed w-full flex justify-between p-5 top-0 left-0 bg-bg z-50">
      {
        backBtn &&
        <div className="flex">
          <AGButton nm fit onClickEvent={() => router.back()}>
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
