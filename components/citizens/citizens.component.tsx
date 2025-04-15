import { useRef, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { GetAnimationByCampaignAndName, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombinationString, GetEnvMapListByCampaign } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { ChangeFeature, ChangeStartAnimation, SetEnvironment, SetFeaturesData } from "../avatar/editor.component";
import { LogError } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { ExportInterface } from "../../interfaces/common.interface";

export default function CitizensComponent() {
  // REDUX State
  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const campaignParams = useAppSelector(state => state.citizensMetadata.CampaignParameters);
  const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);

  // Local references
  const exportData = useRef<ExportInterface>({ attributes: [] });
  const featureList = useRef<FeatureInterface[]>();
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

    featureList.current = filteredOptionList;
    console.log('Filtered feature list', featureList.current);

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

  return <CitizensUI isReady={isAllReady} handleReady={() => onAvatarBuilderReady()} />
}
