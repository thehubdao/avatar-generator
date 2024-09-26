import { useEffect, useState } from "react";
import { CampaignParameters } from "../../interfaces/common.interface";
import MobileLayout from "../../layouts/mobile.layout";
import { Campaign } from "../../types/metadata.type";
import LoginUI from "../../ui/citizens/sections/login.ui";
import CampaignList from "../../ui/citizens/common/campaignList.ui";
import Image from "next/image";
import ConnectButton from "../../ui/citizens/common/connectButton.ui";
import AvatarEditor from "../avatar/editor.component";
import CitizensUI from "../../ui/citizens/citizens.ui";

interface CitizensComponentProps {
  campaignParams?: CampaignParameters;
  setCampaign: (campaign: Campaign | undefined) => void;
}

export default function CitizensComponent({ campaignParams, setCampaign, }: CitizensComponentProps) {
  const [provider, setProvider] = useState<boolean>(false); // false: log out, true: logged in
  const [selectedCombination, setSelectedCombination] = useState<string>();

  useEffect(() => {
    console.log('Campaign params: ', campaignParams);
    // setCampaign('vrm_female');
  }, [])

  async function onAvatarBuilderReady(
    currentCombination: string,
    campaign?: string
  ) {
    if (!campaign) return

    console.log('onAvatarBuilderReady');
    
    // await Promise.all([
    //   getStageList(),
    //   getEnvironmentMapList(),
    //   getSingleInfo(),
    //   getSingleData(campaign, currentCombination),
    // ])

    // await SetFeaturesData(campaignParams?.features ?? [])

    // const bgMap = envMapList?.find(
    //   (em) => em.name === campaignParams?.config.envMap?.defBgMap
    // )
    // const lightMap = envMapList?.find(
    //   (em) => em.name === campaignParams?.config.envMap?.defLightMap
    // )
    // await SetEnvironment(
    //   bgMap?.path,
    //   lightMap?.path,
    //   campaignParams?.config.envMap?.skyboxConfig
    // )

    // Set features from single
    // await loadSingleData()

    // Set skin tone
    // await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'ffffff')

    // Set animation
    // const result = await GetAnimationByCampaignAndName(
    //   campaignParams?.campaign,
    //   campaignParams?.config.defAnimation
    // )

    // if (result.success) {
    //   await ChangeStartAnimation(result.value.at(0)?.path)
    // }

    // fade loader view
    // await handleFadeLoader(loaderDivElement, () => {
    //   setIsLoading(false)
    // })
  }

  return (
    <MobileLayout>
      <div className="w-full min-h-screen bg-[#202020] font-work">

        {!provider ?
          <LoginUI />
          :
          !selectedCombination ?
            <div className="pt-[25vh]">
              <CampaignList />
              <div className="grid justify-items-center py-20">
                <h1 className="font-monument text-7xl text-white text-center">CITIZENS PORTAL</h1>
                <p className="text-2xl text-white">The home of creators in the 3D Web</p>
              </div>
            </div>
            :
            campaignParams && campaignParams.campaign ?
              <>
                <div>
                  <AvatarEditor
                    avatarBasePath={
                      campaignParams.armature
                    }
                    editMode={false}
                    lights={
                      campaignParams.config.lights
                    }
                    defaultShadow={
                      campaignParams.config
                        .defShadow
                    }
                    defaultCamera={
                      campaignParams.config.defCam
                    }
                    postProcessing={
                      campaignParams.config
                        .postProcessing
                    }
                    onReady={() =>
                      onAvatarBuilderReady(
                        selectedCombination,
                        campaignParams.campaign
                      )
                    }
                  />
                </div>
                <CitizensUI />
              </>
              :
              <div className="w-full h-screen flex justify-center items-center">
                <p className="font-monument text-white">Something is wrong!</p>
              </div>
        }

        {/* HEADER */}
        <div className="fixed w-fit h-fit left-4 top-8">
          <Image
            src='/resources/images/the-hub-logo-white.svg'
            alt="the hub icon"
            width={182}
            height={32}
          />
        </div>
        <div className="fixed top-8 right-4">
          <ConnectButton isConnected={provider} />
        </div>
      </div>
    </MobileLayout>
  )
}