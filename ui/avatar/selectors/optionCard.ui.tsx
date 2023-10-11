import GetImage from "../../../components/commons/getImage.component"
import { FeatureInterface } from "../../../interfaces/api.interface"

interface OptionCardUIProps {
  option: FeatureInterface,
  isActive?: boolean
}

export default function OptionCardUI({ option, isActive }: OptionCardUIProps) {
  return (
    <div className={`w-[132px] h-[170px] rounded-lg overflow-hidden cursor-pointer`}>
      <div className="relative bg-[#3d3d3d] w-full h-[132px] flex justify-center items-center">
        <GetImage url={option.thumb} alt={option.path} />
      </div>
      <div className={`w-full h-[38px] flex justify-center items-center ${isActive ? 'bg-accent' : 'bg-white'}`}>
        <p className={`font-poppins font-medium text-xs uppercase w-full px-2 text-center truncate ${isActive ? 'text-white' : 'text-gray-normal'}`}>{option.name}</p>
      </div>
    </div>
  )
}