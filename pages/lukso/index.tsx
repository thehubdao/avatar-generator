import LuksoComponent from "../../components/lukso/lukso.component";
import { GetParameter, UploadFile } from "../../utils/firebase.util";
import { CampaignParameters } from "../../interfaces/common.interface";
import { CampaignParameterName, Module } from "../../enums/common.enum";
import { LogError, RemoveUndefinedProperties } from "../../utils/common.util";
import { useEffect, useState } from "react";
import { Campaign } from "../../types/metadata.type";
import fs from 'fs'
import path from 'path';
import { StorageLocation } from "../../enums/firebase.enum";

export async function getStaticProps() {
  const rutaCarpeta = path.join(process.cwd(), 'public', 'avatar_portraits');
  const imagenes = fs.readdirSync(rutaCarpeta);

  return {
    props: {
      imagenes,
    },
  };
}

export default function LuksoAvatarView({ imagenes }: any) {
  const [campaign, setCampaign] = useState<Campaign>(process.env.NEXT_PUBLIC_CAMPAIGN as Campaign)
  const [campaignParams, setCampaignParams] = useState<CampaignParameters>()

  const getBlob = async () => {
    for (let index = 0; index < imagenes.length; index++) {
      const element = imagenes[index];
      console.log(element, index+1)
      const respuesta = await fetch(`/api/obtener-blob?nombre=${element}`);
      const blob = await respuesta.blob();
      const imageFile = new File([blob], `${element}`, { type: 'image/png' })
      await UploadFile(imageFile, StorageLocation.AvatarImages, undefined, 'lukso2')
    }

  }

  useEffect(() => { getBlob() })

  const getCampaignParams = async () => {
    const campaignParameters = await GetParameter<CampaignParameters>(campaign, CampaignParameterName.All);
    if (campaignParameters.success) {
      campaignParameters.value.campaign = campaign
      console.log(RemoveUndefinedProperties(campaignParameters.value))
      setCampaignParams(RemoveUndefinedProperties(campaignParameters.value))
    } else void LogError(Module.Lukso, 'Error on getting campaign parameters');

  }


  useEffect(() => {
    if (!campaign) return setCampaignParams(undefined)
    void getCampaignParams()
  }, [campaign])

  return <LuksoComponent campaignParams={campaignParams} setCampaign={(_campaign: Campaign | undefined) => {
  }} />
}