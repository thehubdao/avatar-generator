import Image from "next/image"
import { useEffect, useRef } from "react"
import TransparentBox from "../common/transparentBox.ui"
import { translationInOutBlock, fadeInOutBlock } from "../../../utils/gsap/block_in_out.util";
import { DURATION_ANIMATION_SECTION } from "../../../constants/lukso/animation.constant";
import { IndexFeatureInterface } from "../../../interfaces/api.interface";
import FeatureListUI from "../common/featureList.ui";
import TransparentBoxUI from "../common/transparentBox.ui";

interface MintSectionUIProps {
    features?: IndexFeatureInterface[];
    picture: string;
    combination: string;
    combinationPictureUrl: string
    onClickBackButton: () => void
}

export default function ViewSectionUI({ onClickBackButton, features, combinationPictureUrl }: MintSectionUIProps) {

    const mainFeatureRef = useRef<HTMLDivElement>(null);
    const mintAvatarRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const gsapEnterBlocks = () => {
        if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
        translationInOutBlock(mainFeatureRef.current, DURATION_ANIMATION_SECTION);
        translationInOutBlock(mintAvatarRef.current, DURATION_ANIMATION_SECTION);
        fadeInOutBlock(buttonRef.current, DURATION_ANIMATION_SECTION);
    }

/*     const gsapOutBlocks = () => {
        if (!mainFeatureRef.current || !mintAvatarRef.current || !buttonRef.current) return
        translationInOutBlock(mainFeatureRef.current, DURATION_ANIMATION_SECTION, true);
        translationInOutBlock(mintAvatarRef.current, DURATION_ANIMATION_SECTION, true, true);
        fadeInOutBlock(buttonRef.current, DURATION_ANIMATION_SECTION, true, () => setCurrentSection(LuksoSections.Edit));
    } */

    useEffect(() => {
        void gsapEnterBlocks();
    }, [])

    return (
        <section className={`flex w-full h-full items-center justify-between`}>
            {/*             <div className={`fixed h-screen w-full flex justify-center items-center bg-[#FFCBDE] top-14 duration-100 transition-all ${isShuffling ? 'flex' : 'hidden'}`}>
                <div className="scale-[3]">
                    <Loader />
                </div>
            </div> */}
            {/* Mint features */}
            <div ref={mainFeatureRef} className="max-w-[35%] w-[360px] 2xl:w-[461px] z-10 h-full flex flex-col gap-3">


                <TransparentBox
                    fullWidth
                    border
                    backgroundColorClass="bg-[#FFCBDE]"
                    heightClass="grow"
                    borderSizeClass="border-t-0"
                >
                    <div className="relative px-10 w-full mb-2 bottom-[250px]">
                        <div onClick={
                            onClickBackButton
                        }>
                            <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0]">
                                <div className="flex items-center gap-3">
                                    <p className="text-black">Back Button</p>
                                </div>
                            </TransparentBoxUI></div></div>
                    <div className="relative w-[208px] 2xl:w-[347px] h-[180px] 2xl:h-[301px] overflow-hidden rounded-lg">
                        <Image
                            src={combinationPictureUrl}
                            fill
                            alt="lukso avatar selfie view"
                        /*               style={{ objectFit: 'cover' }} 
                                    className="origin-top scale-[300%] -translate-y-1/4" */
                        />
                    </div>
                    {features &&
                        <FeatureListUI features={features} />
                    }
                </TransparentBox>
            </div>
        </section>
    )
}