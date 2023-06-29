import { AiOutlineHome } from "react-icons/ai";
import { FirestoreLocation } from "../../../../enums/firebase.enum";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import AGButton from "../../../common/ag-button.component";
import { useEffect, useState } from "react";
import AssetList from "./assetList.ui";
import { fetchData } from "../../../../store/currentCampaignSlice";
import { PageLocation } from "../../../../enums/common.enum";
import { IoMdAddCircleOutline } from "react-icons/io";
import { GoToPage } from "../../../../utils/router.util";
import AvatarSingle from "../../../../components/avatar/single.component";
import ConfigCampaign from "./configCampaign.ui";
import CampaignStats from "./campaignStats.ui";

interface EditCampaignUIProps {
  downloadFile: (path: string) => void;
}

export default function EditCampaignUI({ downloadFile }: EditCampaignUIProps) {
  // GET DATA FROM REDUX STORE
  const campaignName = useAppSelector(state => state.currentCampaign.name);
  const campaignParameters = useAppSelector(state => state.currentCampaign.parameters);
  const dispatch = useAppDispatch();

  const navBarOptions: string[] = Object.keys(FirestoreLocation);
  const [navBarOptionSelected, setNavBarOptionSelected] = useState<FirestoreLocation>(FirestoreLocation.Parameters);
  // const [viewSingle, setViewSimple] = useState<boolean>(false);
  // const [viewConfig, setViewConfig] = useState<boolean>(false);

  useEffect(() => {
    void dispatch(fetchData({ campaign: campaignName, location: navBarOptionSelected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navBarOptionSelected]);

  return (
    <>
      <div>
        {/* TITLE */}
        <h1 className="font-humane text-9xl text-gray-normal uppercase">{campaignName}</h1>
        {/* NAVIGATION BUTTONS */}
        <div className="flex">
          {
            navBarOptions.map(x => {
              const val = FirestoreLocation[x as keyof typeof FirestoreLocation];
              return <div className={`${x === 'Parameters' ? 'order-1 text-2xl' : 'order-2'}`} key={x}>
                <AGButton nm selected={navBarOptionSelected == val ? true : false} fit={x === 'Parameters' ? true : false} onClickEvent={() => setNavBarOptionSelected(val)}>
                  <div className={`flex items-center gap-2 p-2`}>
                    <div className={`font-poppins uppercase ${navBarOptionSelected == val ? ' font-semibold' : ''}`}>
                      {x === 'Parameters' ?
                        <AiOutlineHome />
                        :
                        x
                      }
                    </div>
                  </div>
                </AGButton>
              </div>
            })
          }
          <div className="order-2">
            <AGButton nm onClickEvent={() => void GoToPage(PageLocation.AssetCreate)}>
              <div className={`flex items-center gap-2 p-2 font-poppins text-blue`}>
                <IoMdAddCircleOutline className="text-2xl" />
                <p>Add Element</p>
              </div>
            </AGButton>
          </div>
        </div>
        {/* ASSETS LIST */}
        <div className="relative mt-6">
          {
            navBarOptionSelected === FirestoreLocation.Parameters ?
              <>
                {
                  campaignParameters.features &&
                  <>
                    <div className="w-full h-[calc(1216px_*_9_/_16)] bg-gradient-to-r from-gray-dark to-gray-dark/95 rounded-2xl">
                      <AvatarSingle campaign={campaignName} avatarBasePath={campaignParameters.armature} featureList={campaignParameters.features} />
                    </div>
                    <ConfigCampaign configData={campaignParameters.config} downloadFile={(path: string) => downloadFile(path)} />
                    <CampaignStats
                      featuresCount={campaignParameters.features?.length ?? 0}
                      accessoriesCount={campaignParameters.accessories?.length ?? 0}
                      defAnimation={campaignParameters.config?.defAnimation}
                      defScene={campaignParameters.config?.defEnvironment}
                      defEnvironment={campaignParameters.config?.defEnvMap} />
                  </>
                }
              </>
              :
              <AssetList activedOption={navBarOptionSelected} />
          }
        </div>
      </div>
    </>
  )
}