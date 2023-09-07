import { GoToPage } from "../../../../utils/router.util";

import { useState } from "react";


import AGButton from "../../../common/ag-button.component";
import Breadcrumbs from "./breadcrumbs.ui";
import { Breadcrumb, PageLocation } from "../../../../enums/common.enum";

import { IoMdLogOut } from 'react-icons/io';
import { AiOutlineHome } from "react-icons/ai";
import ModalUI from "./modal.ui";

interface HeaderUIProps {
  homeButton: boolean;
  breadCrumbs: Breadcrumb[];
}

export default function HeaderUI({ homeButton, breadCrumbs }: HeaderUIProps) {
  const [shouldShowModal, setShouldShowModal] = useState<boolean>(false);

  return (
    <div className="fixed w-full flex justify-between p-5 top-0 left-0 bg-bg z-50">
      <div className="flex items-center gap-2">
        {
          homeButton &&
          <div className="flex">
            <AGButton nm fit onClickEvent={() => GoToPage(PageLocation.Admin)}>
              <AiOutlineHome />
            </AGButton>
          </div>
        }
        <div>
          <Breadcrumbs paths={breadCrumbs} />
        </div>
      </div>
      <div className="flex">
        <AGButton nm onClickEvent={() => GoToPage(PageLocation.Account)}>
          Account
        </AGButton>
        <div className="relative">
          <AGButton nm fit onClickEvent={() => setShouldShowModal(true)}>
            <IoMdLogOut />
          </AGButton>
          {
            shouldShowModal &&
            <div className="absolute top-full right-0">
              <ModalUI closeModal={() => setShouldShowModal(false)} />
            </div>
          }
        </div>
      </div>
    </div>
  )
}
