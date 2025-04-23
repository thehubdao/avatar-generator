import { useRef, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { FetchBlob, GetAnimationByCampaignAndName, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombinationString, GetEnvMapListByCampaign } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { ChangeFeature, ChangeStartAnimation, GetAvatarGLB, SetEnvironment, SetFeaturesData } from "../avatar/editor.component";
import { LogError } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { ExportInterface } from "../../interfaces/common.interface";
import { StorageLocation } from "../../enums/firebase.enum";
import { fileCampaignNameLabel } from "../../constants/lukso/labels.constant";
import { SaveFile } from "../../utils/exporter.util";

export default function CitizensComponent() {
  // REDUX State
  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const campaignParams = useAppSelector(state => state.citizensMetadata.campaignParameters);
  const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);
  const userFeatures = useAppSelector(state => state.citizensMetadata.userFeatures);

  // Local references
  const exportData = useRef<ExportInterface>({ attributes: [] });
  const featureList = useRef<FeatureInterface[]>([]);
  const optionList = useRef<FeatureInterface[]>([]);
  const envMapList = useRef<EnvMapInterface[]>();
  const singleInitData = useRef<SingleInterface>();

  // Local state
  const [isAllReady, setIsAllReady] = useState<boolean>(false);

  // functions
  function addReplaceAttribute(addId: string, addValue: string) {
    if (exportData.current && exportData.current.attributes.some((x) => x.id === addId)) {
      const oldAttribute = exportData.current.attributes.find(
        (x) => x.id === addId
      )
      if (oldAttribute) oldAttribute.val = addValue;
      return;
    }

    exportData.current.attributes.push({ id: addId, val: addValue });
  }

  async function getFeatureList() {
    if (selectedCitizen === null) {
      LogError(Module.Citizens, 'Missing selected citizen to get feature list!');
      return;
    }

    const result = await GetAssetsListByCampaign(selectedCampaign);
    if (result.success) {
      featureList.current = result.value;
      optionList.current = result.value;
    } else {
      LogError(Module.Citizens, 'Failed to get feature list', result.errCode);
      return;
    }

    const combinationIndexes = selectedCitizen.combination.split('-');
    let filteredOptionList: FeatureInterface[] = [];

    combinationIndexes?.forEach((featureIndex: string, index) => {
      const filteredArray = featureList.current?.filter((val) => {
        const categoryIndex = campaignParams?.features?.find(
          (category) => {
            return category.displayName === val.type
          }
        )?.index;

        if (!categoryIndex) return;

        return (
          categoryIndex - 1 === index &&
          val.index.toString() === featureIndex
        )
      })

      if (!filteredArray) return;

      filteredOptionList = filteredOptionList.concat(filteredArray)
    });

    if (userFeatures !== null) {
      const campaignuserFeatures = userFeatures[selectedCampaign as string];
      if (campaignuserFeatures) {
        const formatteduserWearables = campaignuserFeatures
          .map((val) => {
            return optionList.current?.find(
              (option) =>
                option.type === val.type &&
                val.index === option.index
            ) as FeatureInterface
          })
          .filter((val) => {
            const categoryIndex = campaignParams?.features?.find(
              (category) => {
                return category.displayName === val.type
              }
            )?.index

            if (!categoryIndex || !combinationIndexes) return true

            return !combinationIndexes[categoryIndex - 1]?.includes(
              val.index.toString()
            )
          })
        const featuresWithBalance = formatteduserWearables.map(feature => {
          feature.balance = userFeatures[selectedCampaign as string].find(w => w.type === feature.type && w.index === feature.index)?.balance
          return feature
        })
        filteredOptionList = filteredOptionList.concat(featuresWithBalance)
      }
    } else {
      LogError(Module.Citizens, 'Missing user features to add!');
    }

    optionList.current = filteredOptionList;
  }

  async function getEnvironmentMapList() {
    const result = await GetEnvMapListByCampaign(selectedCampaign as string);
    envMapList.current = result.success ? result.value : undefined;
  }

  async function getSingleInfo() {
    const result = await GetAvatarSingleByCampaignCombinationString(
      selectedCampaign as string,
      selectedCitizen?.combination as string
    )
    singleInitData.current = result.success ? result.value : undefined
  }

  async function getSingleData(campaign: string, combination: string) {
    const result = await GetAvatarSingleByCampaignCombinationString(campaign, combination);
    if (result.success) {
      singleInitData.current = result.value;
    } else {
      LogError(Module.Citizens, 'Failed to get single data', result.errCode);
      return;
    }

    await getFeatureList();

    singleInitData.current.features.forEach((feature) => {
      addReplaceAttribute(feature.val.type, feature.val.name);
    });
  }

  async function loadSingleData() {
    if (selectedCitizen === null) {
      LogError(Module.Citizens, 'Missing selected citizen to load single data!');
      return;
    }
    if (!singleInitData.current) {
      LogError(Module.Citizens, 'Missing single data!');
      return;
    }
    for (const { val } of singleInitData.current.features) {
      const { id, path, type, name } = val;

      await ChangeFeature(
        id,
        path,
        name,
        type,
        campaignParams?.config.skin?.defColor ?? 'ffffff'
      );
    }
  }

  async function onAvatarBuilderReady() {
    try {
      await Promise.all([
        getEnvironmentMapList(),
        getSingleInfo(),
        getSingleData(selectedCampaign as string, selectedCitizen?.combination as string),
      ])

      await SetFeaturesData(campaignParams?.features ?? []);

      const bgMap = envMapList.current?.find(
        (em) => em.name === 'gray-01'
      )
      const lightMap = envMapList.current?.find(
        (em) => em.name === campaignParams?.config.envMap?.defLightMap
      )

      await SetEnvironment(
        bgMap?.path,
        lightMap?.path,
        campaignParams?.config.envMap?.skyboxConfig
      )

      // Set features from single
      await loadSingleData();

      // Set animation
      const animationResult = await GetAnimationByCampaignAndName(
        selectedCampaign,
        campaignParams?.config.defAnimation
      );

      if (animationResult.success) {
        await ChangeStartAnimation(animationResult.value.at(0)?.path)
      } else {
        LogError(Module.Citizens, 'Failed to change start animation', animationResult.errCode);
      }

      setIsAllReady(true);
    } catch (error) {
      console.error('Error getting environment map list', error);
    }
  }

  async function exportModel() {
    exportData.current.attributesBase64 = window.btoa(
      JSON.stringify(exportData.current.attributes)
    )
    const vrmStorageUrl = `https://firebasestorage.googleapis.com/v0/b/avatar-generator-e430b.appspot.com/o/${campaignParams?.campaign}%2F${StorageLocation.AvatarVrms}%2F${selectedCitizen!.combination}.vrm?alt=media&token=ad2e1e79-6c26-4284-92c3-2e42f5166b42`
    const [
      picturePromise,
      modelGLBPromise,
      modelVRMPromise,
    ] = await Promise.all([
      FetchBlob(selectedCitizen!.imageUrl),
      GetAvatarGLB(),
      FetchBlob(vrmStorageUrl),
    ])
    console.log('EXPORTING VRM, GLB and image...')
    const modelVRM = modelVRMPromise
    const modelGLB = modelGLBPromise.success
      ? modelGLBPromise.value
      : undefined
    const filesName =
      fileCampaignNameLabel[campaignParams?.campaign as keyof typeof fileCampaignNameLabel] +
      selectedCitizen!.tokenId
    if (modelVRM && modelGLBPromise.success) {
      await SaveFile(modelVRM, `${filesName}.vrm`)
      await SaveFile(modelGLB, `${filesName}.glb`)
      await SaveFile(picturePromise, `${filesName}.png`)
    }
  }

  async function changeFeaturefromHud(
    id: string,
    path: string,
    name: string,
    category: string
  ) {
    if (!singleInitData.current) return LogError(Module.Citizens, 'Singlke init data is undefined in changeFeaturefromHud');

    const currentFeatures = singleInitData.current.features;
    const changedFeature = optionList.current.find(
      (feature) => feature.type === category && feature.id === id
    )
    const currentFeaturesTypeIndex = currentFeatures?.findIndex(
      (feature) => feature.val.type === category
    )

    if ( currentFeaturesTypeIndex != undefined && changedFeature ) {
      singleInitData.current.features[
        currentFeaturesTypeIndex
      ].val = changedFeature
    }

    await ChangeFeature(
      id,
      path,
      name,
      category,
      campaignParams?.config.skin?.defColor ?? 'FFFFFF',
      campaignParams?.config.skin?.materialName,
      campaignParams?.config.changeMaterial
    )

    addReplaceAttribute(category, name)
  }

  return <CitizensUI 
  singleInitData={singleInitData.current}
  exportData={exportData.current} 
  featureList={optionList.current} 
  isReady={isAllReady} 
  handleReady={() => onAvatarBuilderReady()} 
  handleExport={() => exportModel()} 
  handleOptionChange={(id, path, name, category) => changeFeaturefromHud(id, path, name, category)}
  />
}
