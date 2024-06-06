import Image from "next/image";
import { useState } from "react";
import TransparentBoxUI from "../common/transparentBox.ui";
import { FaRegEye } from "react-icons/fa6";
import { SlPencil } from "react-icons/sl";

interface ListItemProps {
    campaignDBName: string;
    nftName:string;
    tokenId:number;
    imageUrl:string;
    combination:string;
    baseCombination:string;
    fallbackImageUrl:string;
    onClickViewButton: (campaign: string, combination: string, baseCombination: string, combinationPictureUrl: string) => void;
    onClickEditButton: (campaign: string, combination: string, baseCombination: string, combinationPictureUrl: string) => void;

}

export default function ListItem({ tokenId, imageUrl, combination, baseCombination, fallbackImageUrl, campaignDBName, onClickViewButton, onClickEditButton, nftName }: ListItemProps) {
    const [didError, setDidError] = useState(false);
    /* ATTENTION:
    CAMPAIGN REAL NAMES AND CAMPAIGN NAME ON DB IS DIFFERENT AND SHOULD BE TOOK INTO ACOUNT,
    RECOMMENDABLE TO CHANGE IT IN FUTURE.
     */

    if (!baseCombination) baseCombination = combination

    return <>
        <div key={campaignDBName + tokenId} className="relative ml-2 mb-2 bg-[#ffffffbf] rounded-[10px_10px_10px_10px] border-[1.58px] border-solid border-white">

            <div className="group">
                <Image src={!didError ? imageUrl : fallbackImageUrl} alt={"NFT Image"} className="rounded-[10px_10px_0px_0px] " width={254} height={300} onError={() => setDidError(true)}
                />
                <div className="hidden flex-col z-10 justify-center items-center absolute top-[0] group-hover:flex h-[254px] w-[254px] bg-[#ffcadd69] rounded-[10px_10px_0px_0px] border-[1.58px] border-solid border-white" >

                    <div className="px-10 w-full mb-2">
                        <div onClick={() =>
                            onClickViewButton(campaignDBName, combination, baseCombination, imageUrl)
                        }>
                            <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0]">
                                <div className="flex items-center gap-3">
                                    <p className="text-black">View</p>
                                    <FaRegEye />
                                </div>
                            </TransparentBoxUI></div>
                    </div>
                    <div className="px-10 w-full">
                        <div onClick={() => onClickEditButton(campaignDBName, combination, baseCombination, imageUrl)}>
                            <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0]">
                                <div className="flex items-center gap-3">
                                    <p className="text-black">Edit</p>
                                    <SlPencil />
                                </div>
                            </TransparentBoxUI></div></div>

                </div>
            </div>
            <div className="text-center p-1 [font-family:'Work_Sans',Helvetica] font-medium text-slate-800 text-[14px] tracking-[0] leading-[normal]">
                {`${nftName} #${tokenId}`}
            </div>
            <div className="absolute top-[6px] left-[6px] w-[45px] h-[20px] bg-slate-800 rounded-[13px] p-1 m-[-10]">
                <div className="w-[40px] text-center [font-family:'Work_Sans',Helvetica] font-normal text-white text-[12px] tracking-[0] leading-[normal]">
                    {`#${tokenId}`}
                </div>
            </div>
        </div >

    </>

}
