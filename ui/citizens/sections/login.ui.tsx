import { CitizensCollection } from "../../../interfaces/citizens.interface";
import { Campaign } from "../../../types/metadata.type";
import CampaignList from "../common/campaignList.ui";

interface LoginUIProps {
  collections?: CitizensCollection[] | null;
  setIsSigned: (isSigned: boolean, selectedCampaign: Campaign) => void;
}

export default function LoginUI({ collections, setIsSigned }: LoginUIProps) {
  return (
    <>
      {
        collections ?
          <div className="pt-[15vh] 2xl:pt-[25vh] min-h-screen">
            <CampaignList collections={collections} setIsSigned={setIsSigned} />
            <div className="grid justify-items-center pt-4 2xl:pt-10">
              <h1 className="font-monument text-6xl lg:text-7xl text-white text-center"><span className="text-[52px] lg:text-7xl">CITIZENS</span><br className="lg:hidden"/> PORTAL</h1>
              <p className="lg:text-2xl text-white">The home of creators in the 3D Web</p>
            </div>
          </div>
          :
          <div className="font-work w-full h-screen flex justify-center items-center">
            <div className="relative grid justify-items-center">
              <h1 className="font-monument text-7xl text-white text-center">CITIZENS<br /><span className="text-[83px]">PORTAL</span></h1>
              <p className="text-2xl text-white">The home of creators in the 3D Web</p>
              <div className="absolute top-full pt-8">
                {
                  collections === null ?
                    <p className="font-light text-xs text-white">:( Sorry, something is wrong, come back later!</p>
                    :
                    <div className="w-4 h-4 border-t rounded-full animate-spin"></div>
                }
              </div>
            </div>
          </div>
      }

    </>
  )
}