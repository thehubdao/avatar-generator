import Image from "next/image";
import TransparentBoxUI from "../common/transparentBox.ui";
import { FaRegEye } from "react-icons/fa6";
import { SlPencil } from "react-icons/sl";
import { useEffect, useState } from "react";
import { getTokenMetadata, tempCampaignSwitch } from "../../../utils/web3/contract.util";
import { Campaign, TokenId, TokenMetadata } from "../../../types/metadata.type";
import { UploadFile } from "../../../utils/firebase.util";
import { StorageLocation } from "../../../enums/firebase.enum";
import Loader from "./loader.ui";

interface ListItemProps {
  campaignDBName: Campaign;
  nftName: string;
  onClickViewButton: (campaign: Campaign, combination: string, baseCombination: string, combinationPictureUrl: string, tokenMetadata:TokenMetadata, tokenId:number) => void;
  onClickEditButton: (campaign: Campaign, combination: string, baseCombination: string, combinationPictureUrl: string, tokenMetadata:TokenMetadata, tokenId:number) => void;
  tokenId: TokenId
}

export default function ListItem({ campaignDBName, onClickViewButton, onClickEditButton, nftName, tokenId }: ListItemProps) {
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>()
  const [didError, setDidError] = useState(false);
  const [shouldReveal, setShouldReveal] = useState(false);

  useEffect(() => {
    const setTokenMetadataPromise = async () => {
      const tokenMetadata = await getTokenMetadata(tokenId);
      setTokenMetadata(tokenMetadata)
    }
    setTokenMetadataPromise()
  }, [tokenId.metadataUri])

  return <div key={campaignDBName + tokenId} className="w-full relative bg-[#ffffffbf] rounded-[10px_10px_10px_10px] border-[1.58px] border-solid border-white overflow-hidden flex flex-col items-center">
    {!shouldReveal &&
      <div className="w-64 h-64 bg-client-primary flex justify-center items-center z-10">
        <Loader />
      </div>
    }
    {tokenMetadata &&
      <>
        <div className={`group w-64 h-64 overflow-hidden ${shouldReveal ? 'relative' : 'absolute'}`}>
          <Image
            src={!didError ? tokenMetadata.imageUrl : tokenMetadata.imageUrl}
            alt={"NFT Image"}
            className={`rounded-[10px_10px_0px_0px] opacity-0 ${shouldReveal ? 'scale-100 opacity-100' : 'scale-125'} group-hover:scale-110 transition-all duration-1000 ease-out`}
            width={640}
            height={640}
            onError={async () => {
              const imageRequest = await fetch(tokenMetadata.fallbackImageUrl)
              const imageBlob = await imageRequest.blob()
              const imageFile = new File([imageBlob], `${tokenMetadata.combination}.png`)
              await UploadFile(imageFile, StorageLocation.AvatarImages, undefined, tempCampaignSwitch[tokenId.campaign as keyof typeof tempCampaignSwitch])
              setDidError(true)
            }}
            onLoadingComplete={() => setShouldReveal(true)}
          />
          {/* BUTTONS */}
          <div className="flex flex-col z-10 justify-center items-center absolute inset-0 opacity-0 group-hover:opacity-100 h-[256px] w-full rounded-[10px_10px_0px_0px] backdrop-blur-sm transition-opacity duration-500">
            <div className="px-10 w-full mb-2">
              <div onClick={() =>
                onClickViewButton(campaignDBName, tokenMetadata.combination, tokenMetadata.baseCombination, tokenMetadata.imageUrl, tokenMetadata, Number(tokenId.tokenId))
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
              <div onClick={() => onClickEditButton(campaignDBName, tokenMetadata.combination, tokenMetadata.baseCombination, tokenMetadata.imageUrl, tokenMetadata, Number(tokenId.tokenId))}>
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
        {/* LABEL */}
        <div className="text-center p-1 [font-family:'Work_Sans',Helvetica] font-medium text-slate-800 text-[14px] tracking-[0] leading-[normal]">
          {`${nftName} #${tokenId.tokenId}`}
        </div>
        {/* ID */}
        <div className="absolute top-[6px] left-[6px] w-[45px] h-[20px] bg-slate-800 rounded-[13px] p-1 m-[-10] z-20">
          <div className="w-[40px] text-center [font-family:'Work_Sans',Helvetica] font-normal text-white text-[12px] tracking-[0] leading-[normal]">
            {`#${tokenId.tokenId}`}
          </div>
        </div>
      </>
    }
  </div>
}