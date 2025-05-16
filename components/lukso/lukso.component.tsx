import { useEffect, useState } from 'react'
import combinationsArray from './array.json'
// Components
import AvatarEditor, {
  ChangeFeature,
  ChangeSkinColor,
  GetAvatarGLB,
  GetAvatarVRM,
  SetEnvironment,
  SetFeaturesData,
} from '../avatar/editor.component'

// Enums
import { Module } from '../../enums/common.enum'
import { LuksoSections } from '../../enums/lukso/common.enum'

// Utils
import { LogError } from '../../utils/common.util'
import {
  GetAvatarSingleByCampaignCombination,
  GetAvatarSingleByCampaignCombinationString,
  GetEnvMapListByCampaign,
  PostRequestVRMProcessFile,
} from '../../utils/api.util'
import { SaveFile } from '../../utils/exporter.util'


// Interfaces
import {
  EnvMapInterface,
  SingleInterface,
} from '../../interfaces/api.interface'
import {
  BasicData,
  CampaignParameters,
  ExportInterface,
} from '../../interfaces/common.interface'
import { Campaign, TokenMetadata } from '../../types/metadata.type'
import { BodyPart } from '../../types/avatar.type'
import Loader from '../../ui/lukso/common/loader.ui'
import { StorageLocation } from '../../enums/firebase.enum'
import { UploadFile } from '../../utils/firebase.util'

let exportData: ExportInterface = { attributes: [] }
let envMapList: EnvMapInterface[] | undefined;
let singleInitData: SingleInterface | undefined


const tokenMetadata: TokenMetadata = {
  name: '',
  description: '',
  GLBUrl: '',
  body: {},
  links: [], assets: [],
  tokenId: '',
  campaign: '',
  imageUrl: '',
  combination: '',
  images: [],
  baseCombination: '',
  fallbackImageUrl: ''
}

export default function LuksoComponent({
  campaignParams,
}: {
  campaignParams?: CampaignParameters,
  setCampaign: (campaign: Campaign | undefined) => void
}) {
  // Loading flags
  const [currentSection] = useState<LuksoSections>(
    LuksoSections.Edit
  )


  async function onAvatarBuilderReady(campaign?: string) {
    if (!campaign) return
    await Promise.all([
      getEnvironmentMapList(),
      getSingleInfo(),
    ])

    await SetFeaturesData(campaignParams?.features ?? [])

    const bgMap = envMapList?.find(em => em.name === campaignParams?.config.envMap?.defBgMap);
    const lightMap = envMapList?.find(em => em.name === campaignParams?.config.envMap?.defLightMap);
    await SetEnvironment(bgMap?.path, lightMap?.path, campaignParams?.config.envMap?.skyboxConfig);
    const combArray = combinationsArray

    for (let i = 0; i < combArray.length; i++) {
      const combination = combArray[i];
      exportData = { attributes: [] }
      await getSingleData(campaignParams?.campaign as string, combination)
      await loadSingleData()
      await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'FFFFFF')
      await exportModel(combination)
    }
  }

  async function getEnvironmentMapList() {
    if (!campaignParams?.campaign) return
    const result = await GetEnvMapListByCampaign(campaignParams?.campaign);
    envMapList = result.success ? result.value : undefined;
  }

  async function getSingleInfo() {
    if (campaignParams?.config.defAvatarCombination == undefined || !campaignParams?.campaign) return

    const result = await GetAvatarSingleByCampaignCombination(
      campaignParams?.campaign,
      campaignParams.config.defAvatarCombination
    )
    singleInitData = result.success ? result.value : undefined
  }

  async function getSingleData(campaign: string, combination: string) {
    const numResult = await GetAvatarSingleByCampaignCombinationString(
      campaign, combination
    )
    const result: SingleInterface | undefined = numResult.success
      ? numResult.value
      : undefined
    if (!result) return console.log("No result for " + combination)
    singleInitData = result
    singleInitData?.features.forEach((feature) => { addReplaceAttribute(feature.val.type, feature.val.name) })
  }

  async function loadSingleData() {
    // Iterate the features
    // Place the features on the model
    if (singleInitData === undefined)
      return void LogError(Module.Lukso, 'Missing single data!!!!!')

    for (const {
      val
    } of singleInitData.features) {
      const { id, path, type, name } = val
      const bodyIndex: keyof typeof tokenMetadata.body = val.type.toLowerCase() as keyof typeof tokenMetadata.body
      tokenMetadata.body[bodyIndex] = val as BodyPart
      // Set feature on model
      await ChangeFeature(
        id,
        path,
        name,
        type,
        campaignParams?.config.skin?.defColor ?? 'FFFFFF'
      )
    }
  }

  function addReplaceAttribute(addId: string, addValue: string) {
    if (exportData && exportData.attributes.some((x) => x.id === addId)) {
      const oldAttribute = exportData.attributes.find(
        (x) => x.id === addId
      )
      if (oldAttribute) oldAttribute.val = addValue
    }

    exportData?.attributes.push({ id: addId, val: addValue })
  }

  async function exportModel(combination: string) {
    exportData.attributesBase64 = window.btoa(
      JSON.stringify(exportData.attributes)
    )
    const [modelGLBPromise, modelVRMPromise] = await Promise.all([
      GetAvatarGLB(),
      GetAvatarVRM()
    ]);
    console.log("Downloading for " + combination)
    const modelVRM = modelVRMPromise.success ? modelVRMPromise.value : undefined;
    const modelGLB = modelGLBPromise.success ? modelGLBPromise.value : undefined;
    if (modelVRMPromise.success && modelGLBPromise.success) {
      await SaveFile(modelGLB, `${combination}.glb`)
      try {
        const refinedModelVRM = await PostRequestVRMProcessFile(modelVRM as Blob)
        await UploadFile(new File([refinedModelVRM], `${combination}.vrm`), StorageLocation.AvatarVrms, undefined, campaignParams?.campaign)
        await SaveFile(refinedModelVRM, `${combination}.vrm`)
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <>
      {/* MAIN VIEW */}
      {
        <div className="w-full h-screen bg-client-primary flex flex-col">
          {/* CAMPAIGN VIEWER */}
          {campaignParams?.campaign && campaignParams &&
            <>
              {/* CANVAS WRAPPER */}
              <div className="fixed left-[50%] translate-x-[-50%] flex justify-center xl:justify-end items-start !w-full !h-full overflow-hidden transition-width transition-height duration-300 ease-in-out">
                {/* CANVAS BACKGROUND */}
                <div className="w-full h-screen absolute inset-0 bg-client-primary" />
                {/* CANVAS */}
                {campaignParams?.campaign &&
                  <AvatarEditor
                    avatarBasePath={campaignParams.armature}
                    editMode={false}
                    lights={campaignParams.config.lights}
                    defaultShadow={campaignParams.config.defShadow}
                    defaultCamera={campaignParams.config.defCam}
                    postProcessing={campaignParams.config.postProcessing}
                    onReady={() => onAvatarBuilderReady(campaignParams.campaign)}
                  />
                }
              </div>
            </>
          }
        </div>
      }
    </>
  )
}
