import GetImage from "../../../components/commons/getImage.component"
import { FeatureInterface } from "../../../interfaces/api.interface"
import MedalSVG from "../../citizens/common/SVG/medalSVG.ui"

interface OptionCardUIProps {
  option: FeatureInterface,
  isActive?: boolean
}

export default function OptionCardUI({ option, isActive }: OptionCardUIProps) {
  return (
    <div className={`w-[132px] dark:w-[164px] h-[170px] dark:h-[206px] rounded-lg overflow-hidden cursor-pointer`}>
      <div className="relative bg-[#3d3d3d] w-full h-[132px] dark:h-[164px] flex justify-center items-center">
        <GetImage url={option.thumb} alt={option.path} />
        <div className="absolute inset-2 bg-citizens-bluedark w-fit h-fit text-xs text-white px-2 py-1 rounded-full">
          {option.balance ? `${option.balance} units` : 'BASE'}
        </div>
        <div className="absolute right-2 top-2">
          <MedalSVG withCircle={isActive} />
        </div>
      </div>
      <div className={`w-full h-[38px] dark:h-[42px] flex justify-center items-center ${isActive ? 'bg-accent' : 'bg-white'}`}>
        <p className={`font-poppins font-medium text-sm uppercase w-full px-2 text-center truncate ${isActive ? 'text-white' : 'text-gray-normal'}`}>{option.name}</p>
      </div>
    </div>
  )
}