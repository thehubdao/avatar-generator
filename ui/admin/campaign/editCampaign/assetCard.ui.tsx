import { useState } from "react";
import GetImage from "../../../../components/commons/getImage.component";
import AGButton from "../../../common/ag-button.component";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineCloudUpload, AiOutlineDelete, AiOutlineEdit, AiOutlineLink } from "react-icons/ai";
import { IoImageOutline } from "react-icons/io5";
import { DeleteDoc } from "../../../../utils/firebase.util";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchData } from "../../../../store/currentCampaignSlice";
import { ShowModal } from "../../../../utils/modal.util";

interface AssetCardInterface {
  id: string;
  name: string;
  thumb?: string;
  location: FirestoreLocation;
}

export default function AssetCard({ id, name, thumb, location }: AssetCardInterface) {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const [onDelete, setOnDelete] = useState<boolean>(false);
  const [onEdit, setOnEdit] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  async function deleteDoc(docId: string) {
    const result = await DeleteDoc(location, docId, campaignName);
    ShowModal(`Doc "${result}" has been deleted.`);
    void dispatch(fetchData({campaign: campaignName, location: location}));
  }

  return (
    <div className="relative w-56 p-4 shadow-flat-soft overflow-hidden bg-bg rounded-lg hover:shadow-flat-hard transition-all duration-300 cursor-pointer group">
      {/* DATA */}
      <div className="pb-2">
        {name && <p className="font-poppins font-medium text-xl text-gray-normal uppercase truncate max-w-full">{name}</p>}
      </div>
      {/* THUMBNAIL */}
      <div className="relative w-[192px] h-[192px] flex justify-center items-center bg-[#3d3d3d]">
        <GetImage url={thumb} alt={name} />
      </div>
      {/* ACTION BUTTONS */}
      <div className="flex justify-between items-center text-xl absolute bottom-0 left-0 w-56 p-2 min-h-[64px] bg-bg opacity-0 group-hover:opacity-100 animation-opacity duration-300">
        {
          onDelete ?
            <div className="flex items-center justify-between w-full">
              <p className="pl-2 text-sm">Are you sure?</p>
              <div className="flex">
                <AGButton nm fit onClickEvent={() => void deleteDoc(id)}>
                  <AiOutlineCheckCircle />
                </AGButton>
                <AGButton nm fit onClickEvent={() => setOnDelete(false)}>
                  <AiOutlineCloseCircle />
                </AGButton>
              </div>
            </div>
            : onEdit ?
              <>
                <div className="w-full">
                  <label htmlFor="" className="text-sm">Name: </label>
                  <input type="text" className="shadow-inset-soft hover:shadow-inset-medium px-2 py-1 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg" min='5' max='20' defaultValue={name} />
                  <div className="flex justify-between">
                    <div className="flex">
                      <AGButton nm fit onClickEvent={() => {
                        setOnEdit(false);
                      }}>
                        <AiOutlineCloudUpload />
                      </AGButton>
                      <AGButton nm fit onClickEvent={() => {
                        setOnEdit(false);
                      }}>
                        <IoImageOutline />
                      </AGButton>
                    </div>
                    <div className="flex">
                      <AGButton nm fit onClickEvent={() => setOnEdit(false)}>
                        <AiOutlineCloseCircle />
                      </AGButton>
                      <AGButton nm fit onClickEvent={() => null}>
                        <AiOutlineCheckCircle />
                      </AGButton>
                    </div>
                  </div>
                </div>
              </>
              :
              <>
                <div className="flex">
                  <AGButton nm fit onClickEvent={() => null}>
                    <AiOutlineLink />
                  </AGButton>
                </div>
                <div className="flex justify-end items-center">
                  <AGButton nm fit onClickEvent={() => setOnEdit(true)}>
                    <AiOutlineEdit />
                  </AGButton>
                  <AGButton nm fit onClickEvent={() => setOnDelete(true)}>
                    <AiOutlineDelete />
                  </AGButton>
                </div>
              </>
        }
      </div>
    </div>
  )
}