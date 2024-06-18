import Image from "next/image";
import TransparentBoxUI from "../common/transparentBox.ui";
import { FaRegEye } from "react-icons/fa6";
import { SlPencil } from "react-icons/sl";
import { useEffect, useState } from "react";
import { getTokenMetadata } from "../../../utils/web3/contract.util";
import { TokenId } from "../../../types/metadata.type";

interface ListItemProps {
    campaignDBName: string;
    nftName: string;
    onClickViewButton: (campaign: string, combination: string, baseCombination: string, combinationPictureUrl: string) => void;
    onClickEditButton: (campaign: string, combination: string, baseCombination: string, combinationPictureUrl: string) => void;
    tokenId: TokenId
}

export default function ListItem({ campaignDBName, onClickViewButton, onClickEditButton, nftName, tokenId }: ListItemProps) {
    const [tokenMetadata, setTokenMetadata] = useState<{ imageUrl: string, fallbackImageUrl: string, combination: string, baseCombination: string }>()
    const [didError, setDidError] = useState(false);

    useEffect(() => {
        const setTokenMetadataPromise = async () => {
            const tokenMetadata = await getTokenMetadata(tokenId);
            setTokenMetadata(tokenMetadata)
        }
        setTokenMetadataPromise()
    }, [])

    return <div key={campaignDBName + tokenId} className="relative ml-2 mb-2 bg-[#ffffffbf] rounded-[10px_10px_10px_10px] border-[1.58px] border-solid border-white">
        {tokenMetadata && <><div className="group">
            <Image
                src={!didError ? tokenMetadata.imageUrl : tokenMetadata.fallbackImageUrl}
                alt={"NFT Image"}
                className="rounded-[10px_10px_0px_0px]"
                width={254}
                height={300}
                onError={() => setDidError(true)}
            />
            <div className="hidden flex-col z-10 justify-center items-center absolute top-[0] group-hover:flex h-[254px] w-[254px] bg-[#ffcadd69] rounded-[10px_10px_0px_0px] border-[1.58px] border-solid border-white">
                <div className="px-10 w-full mb-2">
                    <div onClick={() =>
                        onClickViewButton(campaignDBName, tokenMetadata.combination, tokenMetadata.baseCombination, tokenMetadata.imageUrl)
                    }>
                        <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0]">
                            <div className="flex items-center gap-3">
                                <p className="text-black">View</p>
                                <FaRegEye />
                            </div>
                        </TransparentBoxUI>
                    </div>
                </div>
                <div className="px-10 w-full">
                    <div onClick={() => onClickEditButton(campaignDBName, tokenMetadata.combination, tokenMetadata.baseCombination, tokenMetadata.imageUrl)}>
                        <TransparentBoxUI aditionalClass="cursor-pointer" fullWidth border backgroundColorClass="bg-white" heightClass="h-12" paddingClass="p-[0]">
                            <div className="flex items-center gap-3">
                                <p className="text-black">Edit</p>
                                <SlPencil />
                            </div>
                        </TransparentBoxUI>
                    </div>
                </div>
            </div>
        </div>
            <div className="text-center p-1 [font-family:'Work_Sans',Helvetica] font-medium text-slate-800 text-[14px] tracking-[0] leading-[normal]">
                {`${nftName} #${tokenId.tokenId}`}
            </div>
            <div className="absolute top-[6px] left-[6px] w-[45px] h-[20px] bg-slate-800 rounded-[13px] p-1 m-[-10]">
                <div className="w-[40px] text-center [font-family:'Work_Sans',Helvetica] font-normal text-white text-[12px] tracking-[0] leading-[normal]">
                    {`#${tokenId.tokenId}`}
                </div>
            </div></>}
    </div>
}