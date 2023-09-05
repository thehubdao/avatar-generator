import Image from "next/image";
import LuksoUI from "../../ui/lukso/lukso.ui";
import TransparentBox from "../../ui/common/transparentBox.ui";

export default function LuksoComponent() {
  return (
    <div className="w-full h-screen bg-[#FABCE2] flex flex-col">
      <TransparentBox
        fullWidth
        border
        backgroundColorClass="bg-[#FFCBDE]"
        opacityPercentage="50"
        borderColorClass="border-white"
        borderSizeClass="border-2"
        heightClass="h-14"
        paddingClass="px-11"
        alignItemsClass="items-stretch"
      >
        <Image
          src='/resources/icons/campaigns/lukso.svg'
          width={106}
          height={24}
          alt="Lukso icon"
        />
      </TransparentBox>
      <LuksoUI />
    </div>
  )
}