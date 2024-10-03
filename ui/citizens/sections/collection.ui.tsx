import { useState } from "react";
import { CitizensCollection } from "../../../interfaces/citizens.interface";
import Button from "../common/button.ui";
import CampaignCard from "../common/campaignCard.ui";
import PlusSVG from "../common/SVG/plusSVG.ui";
import SearchSVG from "../common/SVG/searchSVG.ui";
import ArrowSVG from "../common/SVG/arrowSVG.ui";

const CITIZENS: CitizensCollection[] = [
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
  },
  {
    name: 'Collection 04',
    image: 'https://lipsum.app/id/27/280x300/'
  },
  {
    name: 'Collection 05',
    image: 'https://lipsum.app/id/28/280x300/'
  },
  {
    name: 'Collection 06',
    image: 'https://lipsum.app/id/29/280x300/'
  },
  {
    name: 'Collection 07',
    image: 'https://lipsum.app/id/24/280x300/'
  },
  {
    name: 'Collection 08',
    image: 'https://lipsum.app/id/25/280x300/'
  },
  {
    name: 'Collection 09',
    image: 'https://lipsum.app/id/26/280x300/'
  },
  {
    name: 'Collection 10',
    image: 'https://lipsum.app/id/27/280x300/'
  },
  {
    name: 'Collection 11',
    image: 'https://lipsum.app/id/28/280x300/'
  },
  {
    name: 'Collection 12',
    image: 'https://lipsum.app/id/29/280x300/'
  }
]

const CAMPAIGNS: string[] = [
  'Campaign 01',
  'Campaign 02',
  'Campaign 03',
  'Campaign 04',
  'Campaign 05',
  'Campaign 06',
  // 'Campaign 07',
  // 'Campaign 08',
  // 'Campaign 09',
  // 'Campaign 10',
  // 'Campaign 11',
  // 'Campaign 12',
  // 'Campaign 13',
  // 'Campaign 14',
]

export default function Collection() {
  const [tokenID, setTokenId] = useState<string>();
  const [selectedCapmpaign, setSelectedCampaign] = useState<string>(CAMPAIGNS[1]);

  const [isCampaignSelectorOpen, setIsCampaignSelectorOpen] = useState<boolean>(false);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32">
      <div className="container mx-auto">
        <h1 className="font-monument text-white text-6xl text-center">MY CITIZENS</h1>
        <div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
          <div className="w-full flex justify-between p-8 border-b border-white/20">
            <label className="flex">
              <div className="flex justify-center items-center w-12 shadow-citizens-input rounded-l-full">
                <SearchSVG />
              </div>
              <div>
                <input
                  type="number"
                  name=""
                  id=""
                  placeholder="SEARCH BY TOKEN ID"
                  className="w-80 bg-[#2D2D2D] text-lg text-white placeholder:text-white focus-visible:outline-none px-4 py-2 shadow-citizens-input rounded-r-full"
                  value={tokenID}
                  onChange={e => setTokenId(e.target.value)}
                />
              </div>
            </label>
            <div className="relative">
              <Button label="CHOOSE CAMPAIGN" handleClick={() => { setIsCampaignSelectorOpen(!isCampaignSelectorOpen) }} withIcon textStiles="px-4">
                <div className={`${isCampaignSelectorOpen ? 'rotate-180':''}`}>
                  <ArrowSVG className="fill-white"/>
                </div>
              </Button>
              <p className="absolute top-full right-0 px-2 mt-1 text-xs text-white/20">{selectedCapmpaign}</p>
              {isCampaignSelectorOpen &&
                <div className="absolute top-full w-full max-h-96 overflow-y-auto rounded-2xl mt-2 p-4 bg-citizens-dark shadow-citizens-btn z-10">
                  {
                    CAMPAIGNS.map((campaign, index) => (
                      <div key={index} className="py-2 cursor-pointer border-b border-white/10 last:border-none" onClick={() => {
                        setSelectedCampaign(campaign);
                        setIsCampaignSelectorOpen(false);
                      }}>
                        <p className="text-white truncate">{campaign}</p>
                      </div>
                    ))
                  }
                </div>
              }
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 p-8">
            {
              CITIZENS.map((el, i) => (
                <CampaignCard key={i} title={el.name} imgSrc={el.image} imgAlt={el.name} small light />
              ))
            }
          </div>
          <div className="w-full pb-8">
            <Button label="LOAD MORE" handleClick={() => { }} withIcon className="mx-auto">
              <PlusSVG />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}