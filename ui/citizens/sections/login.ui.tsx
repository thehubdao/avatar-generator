import Image from "next/image";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import CampaignList from "../common/campaignList.ui";
import Link from "next/link";
import { BackedByLinks } from "../../../enums/citizens/common.enum";
import SocialButtons from "../common/socialButtons.ui";
import PrivacyPolicySVG from "../common/SVG/privacyPolicySVG.ui";
import TermsOfServicesSVG from "../common/SVG/termsOfServicesSVG.ui";

const BACKEDBY = [
  {
    img: 'polygon',
    link: BackedByLinks.Polygon
  },
  {
    img: 'sandbox',
    link: BackedByLinks.Sandbox
  },
  {
    img: 'decentraland',
    link: BackedByLinks.Decentraland
  },
  {
    img: 'brinc',
    link: BackedByLinks.Brinc
  },
  {
    img: 'ocean',
    link: BackedByLinks.Ocean
  },
  {
    img: 'chainlink',
    link: BackedByLinks.Chainlink
  }
]

interface LoginUIProps {
  collections?: CitizensCollection[] | null;
  setIsSigned: (isSigned: boolean) => void;
}

export default function LoginUI({ collections, setIsSigned }: LoginUIProps) {
  return (
    <>
      {
        collections ?
          <div className="pt-[18vh] 2xl:pt-[15vh] min-h-screen">
            {/* LANDING CARD */}
            <div className="relative w-full px-6">
              {/* BACKGROUND */}
              <div className="relative w-full h-[45vh] md:h-[72vh] overflow-hidden rounded-3xl md:rounded-[58px]">
                <Image src={'/resources/images/citizens/login/background.jpg'} fill alt="" className="object-cover object-top md:object-[0%_15%] brightness-90" />
              </div>
              {/* CONTENT */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 lg:-translate-x-0 lg:left-20 -translate-y-1/2 px-6">
                <h1 className="font-monument text-[53px] md:text-[120px] 2xl:text-[170px] text-white text-center leading-[0.8]"><span className="text-[46px] md:text-[104px] 2xl:text-[150px]">CITIZENS</span><br /> PORTAL</h1>
                <p className="text-[15px] lg:text-[34px] 2xl:text-[48px] text-white text-center leading-none">The home of creators in the 3D Web</p>
                <div className="w-full flex justify-center pt-6">
                  <ConnectWeb3Button
                    classStyles="w-fit h-11 bg-white rounded-[20px]"
                    setIsSigned={(isSigned: boolean) => setIsSigned(isSigned)}
                  >
                    <div className="w-full h-full font-light text-lg px-10 md:px-24">
                      FIND OUT MORE
                    </div>
                  </ConnectWeb3Button>
                </div>
              </div>
              {/* CITIZEN */}
              <div className="hidden lg:block absolute bottom-0 right-0 xl:right-6 w-[75vh] xl:w-[80vh] h-[75vh] xl:h-[80vh] overflow-hidden rounded-[58px]">
                <Image src={'/resources/images/citizens/login/background-citizen.png'} fill alt="" className="object-cover object-[0%_15%]" />
              </div>
            </div>
            {/* CAMPAIGNS */}
            <div>
              <h2 className="font-monument text-3xl sm:text-[64px] text-white text-center pb-12 pt-20">CAMPAIGNS</h2>
              <CampaignList collections={collections} setIsSigned={setIsSigned} />
            </div>
            {/* BACKED BY */}
            <div className="pb-[15vh]">
              <h2 className="font-monument text-3xl sm:text-[64px] text-white text-center pb-12 pt-48">BACKED BY</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-0 gap-y-6 mx-6 md:mx-12 xl:mx-32 2xl:mx-80 place-items-center">
                {
                  BACKEDBY.map((item, index) => (
                    <Link key={index} href={item.link} className="bg-[#2B2B2B] rounded-2xl">
                      <div className="relative w-[260px] h-[100px]">
                        <Image src={`/resources/images/citizens/backedby/${item.img}.png`} fill alt="" className="grayscale" />
                      </div>
                    </Link>
                  ))
                }
              </div>
            </div>
            {/* FOOTER */}
            <footer className="w-full border-t-[1px] border-white/10 flex justify-between items-center p-6">
              <div className="flex gap-4 items-center">
                <Link href={''} className="flex flex-col items-center gap-2">
                  <PrivacyPolicySVG />
                  <p className="font-light text-sm text-white text-center">
                    Privacy<br />Policy
                  </p>
                </Link>
                <Link href={''} className="flex flex-col items-center gap-2">
                  <TermsOfServicesSVG />
                  <p className="font-light text-sm text-white text-center">
                    Terms of<br />Service
                  </p>
                </Link>
              </div>
              <div>
                <p className="font-light text-sm text-white">Creador Labs UG. All rights reserved</p>
              </div>
              <div>
                <SocialButtons className='flex gap-4' />
              </div>
            </footer>
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