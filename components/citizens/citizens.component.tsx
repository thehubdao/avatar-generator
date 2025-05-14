import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { FetchBlob, GetAnimationByCampaignAndName, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombinationString, GetEnvMapListByCampaign, PostRequestVRMProcessFile } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { ChangeFeature, ChangeStartAnimation, GetAvatarGLB, GetAvatarVRM, SetEnvironment, SetFeaturesData } from "../avatar/editor.component";
import { Delay, LogError } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { ExportInterface } from "../../interfaces/common.interface";
import { StorageLocation } from "../../enums/firebase.enum";
import { FEMALE_CAMPAIGN_BODY_TYPES, FILE_CAMPAIGN_NAME_LABEL } from "../../constants/lukso/labels.constant";
import { SaveFile } from "../../utils/exporter.util";
import { BodyPart } from "../../interfaces/avatar.interface";
import { UploadMetadata } from "../../utils/metadata.util";
import { BurnDrop, SetTokenMetadata } from "../../utils/web3/lukso/contract.util";
import { Campaign } from "../../enums/citizens/common.enum";
import { setCitizensMetadata, setSelectedCitizen } from "../../store/citizensMetadataSlice";
import { CitizenMetadata } from "../../interfaces/citizens.interface";
import combinationArray from "../../array.json";
import { UploadFile } from "../../utils/firebase.util";

export default function CitizensComponent() {
  const dispatch = useAppDispatch();
  // REDUX State
  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const campaignParams = useAppSelector(state => state.citizensMetadata.campaignParameters);
  const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);
  const userFeatures = useAppSelector(state => state.citizensMetadata.userFeatures);
  const walletAddress = useAppSelector(state => state.citizensAuth.address);
  const citizensMetadata = useAppSelector(state => state.citizensMetadata.citizensMetadata);

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
      );
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
    const baseCombinationIndexes = selectedCitizen.baseCombination.split('-');
    let filteredOptionList: FeatureInterface[] = [];

    combinationIndexes.forEach((featureIndex: string, bodyPartIndex: number) => {
      const category = campaignParams?.features?.[bodyPartIndex].displayName; // Get the category name from the body parts data array
      const categoryFeatureArray = featureList.current.filter(val => val.type === category); // Get all features of the category

      if (!category) return LogError(Module.Citizens, 'Category not found at index ' + bodyPartIndex);

      const currentIndexFeature = categoryFeatureArray.find(val => val.index == parseInt(featureIndex)); // Get the feature by index from the features category array
      const baseFeatureIndex = baseCombinationIndexes[bodyPartIndex]; // Get the base feature index from the base combination

      if (featureIndex != baseFeatureIndex) { //Add the base feature to the filtered option list if the current feature is not equal to the base feature
        const baseIndexFeature = categoryFeatureArray.find(val => val.index === parseInt(baseFeatureIndex)); // Get the feature by index from the base features category array
        if (!baseIndexFeature) return LogError(Module.Citizens, 'Could not find base feature at index ' + baseFeatureIndex + ' in category ' + category);
        filteredOptionList.push(baseIndexFeature);
      }

      if (!currentIndexFeature) return LogError(Module.Citizens, 'Could not find feature at index ' + featureIndex + ' in category ' + category);

      filteredOptionList.push(currentIndexFeature);
    })

    if (!userFeatures) return LogError(Module.Citizens, 'Missing user features to add!');

    const campaignuserFeatures = userFeatures[selectedCampaign as string];
    if (campaignuserFeatures) {
      const formatteduserWearables = campaignuserFeatures
        .map((val) => {
          return optionList.current?.find(
            (option) =>
              option.type === val.type &&
              val.index === option.index
          );
        })
        .filter((val) => {
          const categoryIndex = campaignParams?.features?.find(
            (category) => {
              return category.displayName === val.type;
            }
          )?.index;

          if (!categoryIndex || !combinationIndexes) return true;

          return !combinationIndexes[categoryIndex - 1]?.includes(
            val.index.toString()
          );
        })
      const featuresWithBalance = formatteduserWearables.map(feature => {
        feature.balance = userFeatures[selectedCampaign as string].find(w => w.type === feature.type && w.index === feature.index)?.balance;
        return feature;
      });
      filteredOptionList = filteredOptionList.concat(featuresWithBalance);
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
    );
    singleInitData.current = result.success ? result.value : undefined;
  }

  async function getSingleData(campaign: string, combination: string) {
    const result = await GetAvatarSingleByCampaignCombinationString(campaign, combination);
    if (result.success) {
      singleInitData.current = result.value;
    } else {
      LogError(Module.Citizens, 'Failed to get single data', result.errCode);
      return;
    }
  }

  async function loadSingleData() {
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
      ]);

      await SetFeaturesData(campaignParams?.features ?? []);

      const bgMap = envMapList.current?.find(
        (em) => em.name === 'gray-01'
      );
      const lightMap = envMapList.current?.find(
        (em) => em.name === campaignParams?.config.envMap?.defLightMap
      );

      await SetEnvironment(
        bgMap?.path,
        lightMap?.path,
        campaignParams?.config.envMap?.skyboxConfig
      );

      for (let i = 0; i < combinationArray.length; i++) {
        const combination = combinationArray[i];
        await getSingleData(selectedCampaign as string, combination);
        await loadSingleData();
        await exportModel(combination);
}
      setIsAllReady(true);
    } catch (error) {
      LogError(Module.Citizens, 'Error in onAvatarBuilderReady', error);
    }
  }

  async function exportModel(combination: string) {
    const [modelGLBPromise, modelVRMPromise] = await Promise.all([
      GetAvatarGLB(),
      GetAvatarVRM()
    ]);
    console.log("Downloading for " + combination)
    const modelVRM = modelVRMPromise.success ? modelVRMPromise.value : undefined;
    const modelGLB = modelGLBPromise.success ? modelGLBPromise.value : undefined;
    if (modelVRMPromise.success && modelGLBPromise.success) {
      const refinedModelVRM = await PostRequestVRMProcessFile(modelVRM as Blob)
      await UploadFile(new File([refinedModelVRM], `${combination}.vrm`), StorageLocation.AvatarVrms, undefined, campaignParams?.campaign)
      await SaveFile(modelGLB, `${combination}.glb`)
      await SaveFile(refinedModelVRM, `${combination}.vrm`)
    }
  }

  async function changeFeaturefromHud(
    id: string,
    path: string,
    name: string,
    category: string
  ) {
    if (!singleInitData.current) return LogError(Module.Citizens, 'Single init data is undefined in changeFeaturefromHud');

    const currentFeatures = singleInitData.current.features;
    const changedFeature = optionList.current.find(
      (feature) => feature.type === category && feature.id === id
    );
    const currentFeaturesTypeIndex = currentFeatures?.findIndex(
      (feature) => feature.val.type === category
    );

    if (currentFeaturesTypeIndex != undefined && changedFeature) {
      singleInitData.current.features[
        currentFeaturesTypeIndex
      ].val = changedFeature;
    }

    await ChangeFeature(
      id,
      path,
      name,
      category,
      campaignParams?.config.skin?.defColor ?? 'FFFFFF',
      campaignParams?.config.skin?.materialName,
      campaignParams?.config.changeMaterial
    );

    addReplaceAttribute(category, name);
  }

  async function saveLuksoCombination() {
    const newCombination = singleInitData.current?.features
      .map((feature) => feature.val.index)
      .join('-') as string;

    if (!campaignParams) {
      LogError(Module.Citizens, 'Campaign params is undefined in saveCombination');
      return false;
    }
    if (!singleInitData.current) {
      LogError(Module.Citizens, 'Single init data is undefined in saveCombination');
      return false;
    }
    if (!selectedCitizen) {
      LogError(Module.Citizens, 'Selected citizen is undefined in saveCombination');
      return false;
    }
    if (!walletAddress) {
      LogError(Module.Citizens, 'Wallet address is undefined in saveCombination');
      return false;
    }
    if (!citizensMetadata) {
      LogError(Module.Citizens, 'Citizens metadata is undefined in saveCombination');
      return false;
    }

    const currentCampaign = selectedCampaign;

    if (!currentCampaign) {
      LogError(Module.Citizens, 'Current campaign is undefined in saveCombination');
      return false;
    }

    const currentFeatures = singleInitData.current.features;
    const newMetadata: CitizenMetadata = {
      ...selectedCitizen,
      combination: newCombination,
      attributes: [],
      body: { ...selectedCitizen.body }
    }

    const burnDropArray: BodyPart[] = [];

    currentFeatures.forEach((feature) => {
      newMetadata.attributes.push({
        key:
          currentCampaign == 'vrm_female'
            ? FEMALE_CAMPAIGN_BODY_TYPES[
            feature.val.type.toLowerCase() as keyof typeof FEMALE_CAMPAIGN_BODY_TYPES
            ]
            : feature.val.type.toLowerCase(),
        value: feature.val.name,
        type: 'string',
      });
      let bodyFeature: BodyPart | undefined;

      if (currentCampaign == 'vrm_female') bodyFeature = newMetadata.body[FEMALE_CAMPAIGN_BODY_TYPES[feature.val.type.toLowerCase() as keyof typeof FEMALE_CAMPAIGN_BODY_TYPES] as keyof typeof newMetadata.body];
      else bodyFeature = newMetadata.body[feature.val.type.toLowerCase() as keyof typeof newMetadata.body];

      if (bodyFeature && bodyFeature.name != feature.val.name) {
        newMetadata.body[
          feature.val.type.toLowerCase() as keyof typeof newMetadata.body
        ] = feature.val as BodyPart;

        burnDropArray.push(feature.val as BodyPart);
      }
    });

    const metadataObject = await UploadMetadata(
      newMetadata,
      undefined,
      newCombination,
      selectedCitizen.campaign
    );
    if (!metadataObject.success) {
      LogError(
        Module.Citizens,
        'Failed to upload metadata on saveLuksoCombination',
        metadataObject.errCode
      );
      return false;
    }

    newMetadata.imageUrl = metadataObject.value.imageUrl;

    await SetTokenMetadata(
      currentCampaign,
      selectedCitizen.tokenId,
      metadataObject.value.uri
    );

    for (let i = 0; i < burnDropArray.length; i++) {
      const drop = burnDropArray[i];
      await BurnDrop(walletAddress, currentCampaign, drop);
    }

    const updatedCitizensMetadata = [...citizensMetadata];
    const index = updatedCitizensMetadata.findIndex(x => x.tokenId == selectedCitizen.tokenId);

    if (index == -1) {
      LogError(Module.Citizens, 'Citizen metadata not found in saveLuksoCombination');
      return false;
    }

    updatedCitizensMetadata[index] = newMetadata;

    dispatch(setCitizensMetadata(updatedCitizensMetadata));
    dispatch(setSelectedCitizen(newMetadata));
    return true; // return true in success, false in failure
  }

  async function saveKumiCombination() {
    //TODO: implement kumi combination saving
    return false;
  }

  async function handleSaveCombination() {
    let isSuccess = false;
    if (selectedCampaign == Campaign.Citizens || selectedCampaign == Campaign.Creators) {
      isSuccess = await saveLuksoCombination();
    } else if (selectedCampaign == Campaign.Kumi) {
      isSuccess = await saveKumiCombination();
    }
    return isSuccess;
  }

  async function onMinting() {
    //TODO: Minting function
    // await createAsset(wallets[0], {
    //   name: "KUMI",
    //   uri: "ipfs://" + process.env.NEXT_PUBLIC_KUMI_IPFS_HASH,
    //   plugins: []
    // });
    await Delay(3000);
    return Math.random() > 0.5;
  }

  return <CitizensUI
    singleInitData={singleInitData.current}
    exportData={exportData.current}
    featureList={optionList.current}
    isReady={isAllReady}
    handleReady={() => onAvatarBuilderReady()}
    handleExport={() => exportModel(selectedCitizen?.combination as string)}
    handleOptionChange={(id, path, name, category) => changeFeaturefromHud(id, path, name, category)}
    handleSaveCombination={() => handleSaveCombination()}
    handleMinting={() => onMinting()}
  />
}
