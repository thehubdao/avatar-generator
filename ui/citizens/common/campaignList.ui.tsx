import CampaignCard from "./campaignCard.ui";

export default function CampaignList() {
  return (
    <div className="w-fit grid grid-cols-3 justify-items-center gap-8 mx-auto">
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
      <CampaignCard title="Large Campaign Title" imgSrc="https://lipsum.app/random/280x300/" imgAlt="test" />
    </div>
  )
}