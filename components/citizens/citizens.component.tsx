import { useEffect, useState } from "react";
import { CampaignParameters } from "../../interfaces/common.interface";
import MobileLayout from "../../layouts/mobile.layout";
import { Campaign, TokenId } from "../../types/metadata.type";
import LoginUI from "../../ui/citizens/sections/login.ui";
import Image from "next/image";
import ConnectButton from "../../ui/citizens/common/connectButton.ui";
import AvatarEditor from "../avatar/editor.component";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { useConnectWallet } from "@web3-onboard/react";
import { getCampaignsTokenIds } from "../../utils/web3/contract.util";
import { CitizensCollection } from "../../interfaces/citizens.interface";
import Button from "../../ui/citizens/common/button.ui";
import ArrowLinkSVG from "../../ui/citizens/common/SVG/arrowLinkSVG.ui";
import SocialDiscordSVG from "../../ui/citizens/common/SVG/socialDiscordSVG.ui";
import Link from "next/link";
import SocialInstagramSVG from "../../ui/citizens/common/SVG/socialInstagramSVG.ui";
import SocialXSVG from "../../ui/citizens/common/SVG/socialXSVG.ui";

const COLLECTIONS: CitizensCollection[] = [
  {
    name: 'Collection 01',
    image: 'https://lipsum.app/id/24/280x300/'
  },
  {
    name: 'Collection 02',
    image: 'https://lipsum.app/id/25/280x300/'
  },
  {
    name: 'Collection 03',
    image: 'https://lipsum.app/id/26/280x300/'
  }
  // {
  //   name: 'Collection 04',
  //   image: 'https://lipsum.app/id/27/280x300/'
  // },
  // {
  //   name: 'Collection 05',
  //   image: 'https://lipsum.app/id/28/280x300/'
  // },
  // {
  //   name: 'Collection 06',
  //   image: 'https://lipsum.app/id/29/280x300/'
  // }
]

interface CitizensComponentProps {
  campaignParams?: CampaignParameters;
  setCampaign: (campaign: Campaign | undefined) => void;
}

export default function CitizensComponent({ campaignParams, setCampaign }: CitizensComponentProps) {
  const [isSigned, setIsSigned] = useState<boolean>(false); // false: log out, true: logged in
  const [collectionList] = useState<CitizensCollection[] | null | undefined>(); // collections to show before login, it controls the view flow: undefined: loading state, null: error getting data, CitizensCollection[]: show collections
  const [selectedCombination] = useState<string>('vrm_female');


  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined)

  const [{ wallet }] = useConnectWallet()

  const [, setTokenIdList] = useState<TokenId[]>()



  useEffect(() => {
    console.log('Campaign params: ', campaignParams);
    setCampaign('vrm_female');
  }, [])

  useEffect(() => {
    if (!isSigned || !wallet) return

    const address = wallet.accounts[0].address

    setWalletAddress(address)
  }, [isSigned])

  useEffect(() => {
    if (!walletAddress) return
    const getTokensMetadataPromise = async () => {
      const tokenIds = await getCampaignsTokenIds(walletAddress)
      setTokenIdList(tokenIds)
    }
    void getTokensMetadataPromise()
  }, [walletAddress])

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
        {!isSigned ?
          <LoginUI collections={collectionList} />
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
        <div className="fixed w-fit h-fit left-6 top-8">
          <Image
            src='/resources/images/the-hub-logo-white.svg'
            alt="the hub icon"
            width={182}
            height={32}
          />
        </div>
        {(collectionList || collectionList === null || isSigned) &&
          <div className="fixed top-8 right-6 flex gap-4">
            {!isSigned &&
              <Button label="About" handleClick={() => { }} withIcon textStiles="text-start pl-2">
                <ArrowLinkSVG />
              </Button>
            }
            <ConnectButton isSigned={isSigned} setIsSigned={(isSigned) => { setIsSigned(isSigned) }} address={walletAddress} />
          </div>
        }
        {!isSigned &&
          <div className="flex gap-4 fixed bottom-8 right-6">
            <Link href={'https://x.com/thehub_dao'}>
              <SocialXSVG />
            </Link>
            <Link href={'https://www.instagram.com/thehub_dao/'}>
              <SocialInstagramSVG />
            </Link>
            <Link href={'https://discord.gg/3KvUpQayxp'}>
              <SocialDiscordSVG />
            </Link>
          </div>
        }
      </div>
    </MobileLayout>
  )
}