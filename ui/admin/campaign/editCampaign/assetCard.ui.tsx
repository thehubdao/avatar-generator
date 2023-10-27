import { useRef, useState } from "react";
import GetImage from "../../../../components/commons/getImage.component";
import UpdateAsset from "../../../../components/admin/assets/updateAsset.component";
import AGButton from "../../../common/ag-button.component";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineCloudUpload, AiOutlineDelete, AiOutlineEdit, AiOutlineLoading } from "react-icons/ai";
import { IoImageOutline } from "react-icons/io5";
import { DeleteDoc } from "../../../../utils/firebase.util";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchData } from "../../../../store/currentCampaignSlice";
import { ShowModal } from "../../../../utils/modal.util";
import { CampaignDefaultOption } from "../../../../enums/campaign.enum";
import { CommonString } from "../../../../enums/common.enum";

interface AssetCardProps {
  id: string;
  name: string;
  thumb?: string;
  location: FirestoreLocation;
  activedOption: string;
  updateDefaultAsset: (element: CampaignDefaultOption, config: string) => Promise<void>;
}

export default function AssetCard({ id, name, thumb, location, activedOption, updateDefaultAsset }: AssetCardProps) {
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const campaignConfigParams = useAppSelector(state => state.currentCampaign.parameters.config);

  const filesForm = useRef<HTMLFormElement>(null);

  const currentName = useRef<string>(name);
  const currentFile = useRef<HTMLInputElement>(null);
  const currentThumb = useRef<HTMLInputElement>(null);

  // general states
  const [willDelete, setWillDelete] = useState<boolean>(false);
  const [willEdit, setWillEdit] = useState<boolean>(false);
  const [hasFile, setHasFile] = useState<boolean>(false);
  const [hasThumb, setHasThumb] = useState<boolean>(false);
  const [willUpdateAsset, setWillUpdateAsset] = useState<boolean>(false);

  // loading
  const [isDefaultBeingManipulatied, setIsDefaultBeingManipulatied] = useState<boolean>(false);

  const getCurrentDefaultOption = (): CampaignDefaultOption => {
    switch (activedOption) {
      case FirestoreLocation.Animations:
        return CampaignDefaultOption.DefAnimation;
      case FirestoreLocation.Stages:
        return CampaignDefaultOption.DefStage;
      default:
        return CampaignDefaultOption.NoDef;
    }
  }

  const isCurrentAssetSelectedAsDefault = () => {
    const currentDefaultConfigKey = getCurrentDefaultOption();

    if (currentDefaultConfigKey == CampaignDefaultOption.NoDef)
      return false
    return campaignConfigParams[currentDefaultConfigKey] === name
  }

  const shouldShowDefaultButton = () => {
    const currentDefaultConfigKey = getCurrentDefaultOption();

    if (currentDefaultConfigKey == CampaignDefaultOption.NoDef)
      return false
    return true
  }

  //* Updates default asset config prop.
  const handleUpdateDefaultAsset = (config: string) => {
    const currentDefaultConfigKey = getCurrentDefaultOption();

    setIsDefaultBeingManipulatied(true);
    void updateDefaultAsset(currentDefaultConfigKey, config).then(() => setIsDefaultBeingManipulatied(false));
  };

  const handleClearDefaultAsset = () => {
    const currentDefaultConfigKey = getCurrentDefaultOption();

    setIsDefaultBeingManipulatied(true);
    void updateDefaultAsset(currentDefaultConfigKey, CommonString.empty).then(() => setIsDefaultBeingManipulatied(false));
  }

  const dispatch = useAppDispatch();

  const checkAssetFile = () => {
    const fileLength = currentFile.current?.files?.length;
    const thumbLength = currentThumb.current?.files?.length;
    if (!fileLength || fileLength < 1) {
      setHasFile(false);
    } else {
      setHasFile(true);
    }

    if (!thumbLength || thumbLength < 1) {
      setHasThumb(false);
    } else {
      setHasThumb(true);
    }
  }

  const resetFiles = () => {
    currentName.current = name;
    setHasFile(false);
    setHasThumb(false);
    filesForm.current?.reset();
  }

  async function deleteDoc(docId: string) {
    const result = await DeleteDoc(location, docId, campaignName);
    ShowModal(`Doc "${result}" has been deleted.`);
    void dispatch(fetchData({ campaign: campaignName, location: location }));
  }

  return (
    <>
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
        <div className={`flex justify-between items-center text-xl absolute bottom-0 left-0 w-56 p-2 min-h-[64px] bg-bg ${willEdit || willDelete ? '' : 'opacity-0'} group-hover:opacity-100 animation-opacity duration-300`}>
          {
            willDelete ?
              <div className="flex items-center justify-between w-full">
                <p className="pl-2 text-sm">Are you sure?</p>
                <div className="flex">
                  <AGButton nm fit onClickEvent={() => void deleteDoc(id)}>
                    <AiOutlineCheckCircle className="group-hover/button:text-green-600 transition-all duration-300" />
                  </AGButton>
                  <AGButton nm fit onClickEvent={() => setWillDelete(false)}>
                    <AiOutlineCloseCircle className="group-hover/button:text-red transition-all duration-300" />
                  </AGButton>
                </div>
              </div>
              : willEdit ?
                <>
                  <div className="w-full">
                    <label htmlFor="" className="text-sm">Name: </label>
                    <input
                      type="text"
                      className="shadow-inset-soft hover:shadow-inset-medium px-2 py-1 my-2 min-h-[48px] w-full rounded-lg text-center bg-bg" min='5' max='20'
                      defaultValue={currentName.current}
                      onChange={e => {
                        currentName.current = e.target.value
                      }} />
                    <div className="flex justify-between">
                      <form ref={filesForm} className="flex gap-4 px-2">
                        <label
                          className={`flex justify-center items-center my-2 w-9 shadow-flat-soft hover:shadow-flat-medium rounded-lg cursor-pointer transition-all duration-200 ${hasFile ? 'bg-green-400 text-white' : ''}`}
                          htmlFor={`editGLBAsset-${id}`}>
                          <AiOutlineCloudUpload />
                          <input type="file" id={`editGLBAsset-${id}`} name={`editGLBAsset-${id}`} className="hidden" accept=".glb" ref={currentFile} onChange={() => {
                            checkAssetFile();
                          }} />
                        </label>
                        <label
                          className={`flex justify-center items-center my-2 w-9 shadow-flat-soft hover:shadow-flat-medium rounded-lg cursor-pointer transition-all duration-200 ${hasThumb ? 'bg-green-400 text-white' : ''}`}
                          htmlFor={`editThumbAsset-${id}`}>
                          <IoImageOutline />
                          <input type="file" id={`editThumbAsset-${id}`} name={`editThumbAsset-${id}`} className="hidden" accept="image/png, image/jpeg" ref={currentThumb} onChange={() => {
                            checkAssetFile();
                          }} />
                        </label>
                      </form>
                      <div className="flex">
                        <AGButton nm fit onClickEvent={() => {
                          resetFiles();
                          setWillEdit(false);
                        }}>
                          <AiOutlineCloseCircle className="group-hover/button:text-red transition-all duration-300" />
                        </AGButton>
                        <AGButton nm fit onClickEvent={() => {
                          setWillUpdateAsset(true);
                        }}>
                          <AiOutlineCheckCircle className="group-hover/button:text-green-600 transition-all duration-300" />
                        </AGButton>
                      </div>
                    </div>
                  </div>
                </>
                : <div className={`flex ${shouldShowDefaultButton() ? 'justify-between' : 'justify-end'} items-center text-sm`}>
                  {shouldShowDefaultButton() && (
                    <>{isDefaultBeingManipulatied
                      ? <AGButton nm fit>
                        <div className="w-20 flex justify-center cursor-wait">
                          <AiOutlineLoading className="animate-spin" />
                        </div>
                      </AGButton>
                      : <>
                        {isCurrentAssetSelectedAsDefault()
                          ? <AGButton nm fit selected={isCurrentAssetSelectedAsDefault()} onClickEvent={() => handleClearDefaultAsset()}>
                            <div className="w-20 flex justify-center items-center gap-1">
                              <AiOutlineCheckCircle />
                              <p>default</p>
                            </div>
                          </AGButton>
                          :
                          <AGButton nm fit selected={isCurrentAssetSelectedAsDefault()} onClickEvent={() => handleUpdateDefaultAsset(name)}>
                            <div className="w-20 flex justify-center">
                              <p>Set default</p>
                            </div>
                          </AGButton>
                        }
                      </>
                    }</>
                  )}
                  <AGButton nm fit onClickEvent={() => setWillEdit(true)}>
                    <AiOutlineEdit className="group-hover/button:text-purple transition-all duration-300" />
                  </AGButton>
                  <AGButton nm fit onClickEvent={() => setWillDelete(true)}>
                    <AiOutlineDelete className="group-hover/button:text-red transition-all duration-300" />
                  </AGButton>
                </div>
          }
        </div>
      </div>
      <UpdateAsset
        objectFile={currentFile.current?.files?.item(0)}
        thumbnailFile={currentThumb.current?.files?.item(0)}
        name={currentName.current}
        id={id}
        location={location}
        assetReady={willUpdateAsset}
        onUpdated={() => {
          resetFiles();
          setWillEdit(false);
          setWillUpdateAsset(false);
          void dispatch(fetchData({ campaign: campaignName, location: location }));
        }} />
    </>
  )
}