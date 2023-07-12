interface CampaignStatsProps {
  featuresCount: number;
  accessoriesCount: number;
  defAnimation?: string;
  defStage?: string;
  defEnvironment?: string;
}

export default function CampaignStats({ featuresCount, accessoriesCount, defAnimation, defStage, defEnvironment }: CampaignStatsProps) {
  return (
    <div className="absolute top-0 right-0 p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex items-center gap-2 p-2 rounded-full bg-orange font-bold text-xs">
          <p className="text-white pl-2">Features</p>
          <div className="flex justify-center items-center w-8 h-5 rounded-full shadow-inset-soft bg-bg">
            <p className="text-orange">{featuresCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-full bg-purple font-bold text-xs">
          <p className="text-white pl-2">Accessories</p>
          <div className="flex justify-center items-center w-8 h-5 rounded-full shadow-inset-soft bg-bg">
            <p className="text-purple">{accessoriesCount}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 p-2 rounded-full bg-blue font-bold text-xs">
        <p className="text-white pl-2 truncate">Def. Animation</p>
        <div className="flex justify-center items-center w-2/4 h-5 rounded-full shadow-inset-soft bg-bg">
          <p className="text-blue">{defAnimation ?? '-'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 p-2 rounded-full bg-blue font-bold text-xs">
        <p className="text-white pl-2 truncate">Def. Stage</p>
        <div className="flex justify-center items-center w-2/4 h-5 rounded-full shadow-inset-soft bg-bg">
          <p className="text-blue">{defStage ?? '-'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 p-2 rounded-full bg-blue font-bold text-xs">
        <p className="text-white pl-2 truncate">Def. Environment</p>
        <div className="flex justify-center items-center w-2/4 h-5 rounded-full shadow-inset-soft bg-bg">
          <p className="text-blue">{defEnvironment ?? '-'}</p>
        </div>
      </div>
    </div>
  )
}