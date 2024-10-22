import { CardSize } from "../../../enums/citizens/common.enum";
import CampaignCard from "../common/campaignCard.ui";

export default function Play() {

  function openExternal(link: string) {
    window.open(link, "_blank");
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] py-32">
      {/* MY CITIZENS */}
      <div className="container mx-auto">
        <h1 className="font-monument text-white text-6xl text-center">AVAILABLE GAMES</h1>
        <div className="w-full pt-10 flex justify-center gap-8">
          <CampaignCard imgAlt={'metaverse'} imgSrc={'https://lipsum.app/id/24/275x515'} title="NIFTY ISLAND" size={CardSize.Large} handleClick={() => {
            openExternal('https://www.niftyisland.com/')
          }} />
          <CampaignCard imgAlt={'metaverse'} imgSrc={'https://lipsum.app/id/25/275x515'} title="HYPERFY" size={CardSize.Large} handleClick={() => {
            openExternal('https://hyperfy.io/')
          }} />
          <CampaignCard imgAlt={'metaverse'} imgSrc={'https://lipsum.app/id/26/275x515'} title="DVERSO" size={CardSize.Large} handleClick={() => {
            openExternal('https://dverso.io/')
          }} /> 
        </div>
      </div>
    </div>
  )
}