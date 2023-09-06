import AGButton from "../../common/ag-button.component";

import { IoMdLogOut, IoMdArrowBack } from 'react-icons/io';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "../../../store/hooks";
import { PageLocation } from "../../../enums/common.enum";
import { GoToPage } from "../../../utils/router.util";
import ModalUI from "./header/modal.ui";

export default function Header() {
  const currentCampaign = useAppSelector(state => state.currentCampaign.name);
  const [isBackBtn, setIsBackBtn] = useState<boolean>(false);
  const [shouldShowModal, setShouldShowModal] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (router.pathname !== PageLocation.Admin) {
      setIsBackBtn(true);
      if (router.pathname !== PageLocation.Account && router.pathname !== PageLocation.UserControl && router.pathname !== PageLocation.FirstSteps && currentCampaign === '') {
        void GoToPage(PageLocation.Admin);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      if (router.pathname !== PageLocation.Admin) setIsBackBtn(true);
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return (
    <div className="fixed w-full flex justify-between p-5 top-0 left-0 bg-bg z-50">
      {isBackBtn &&
        <div className="flex">
          <AGButton nm fit onClickEvent={() => router.back()}>
            <IoMdArrowBack />
          </AGButton>
        </div>}
      <div className="flex">
        {router.pathname !== PageLocation.Account &&
          <AGButton nm onClickEvent={() => GoToPage(PageLocation.Account)}>
            Account
          </AGButton>}
        <div className="relative">
          <AGButton nm fit onClickEvent={() => void setShouldShowModal(true)}>
            <IoMdLogOut />
          </AGButton>
          {shouldShowModal &&
            <div className="absolute top-full right-0">
              <ModalUI closeModal={() => setShouldShowModal(false)} />
            </div>}
        </div>
      </div>
    </div>
  )
}
