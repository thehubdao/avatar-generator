import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { FetchBlob, GetAnimationByCampaignAndName, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombinationString, GetEnvMapListByCampaign } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { ChangeFeature, ChangeStartAnimation, GetAvatarGLB, SetEnvironment, SetFeaturesData, ChangeSkinColor } from "../avatar/editor.component";
import { LogError } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { ExportInterface } from "../../interfaces/common.interface";
import { FEMALE_CAMPAIGN_BODY_TYPES, FILE_CAMPAIGN_NAME_LABEL } from "../../constants/lukso/labels.constant";
import { SaveFile } from "../../utils/exporter.util";
import { BodyPart } from "../../interfaces/avatar.interface";
import { UploadLuksoMetadata, UploadSolanaMetadata } from "../../utils/metadata.util";
import { BurnDrop, SetTokenMetadata } from "../../utils/web3/lukso/contract.util";
import { Campaign } from "../../enums/citizens/common.enum";
import { setCitizensMetadata, setSelectedCitizen } from "../../store/citizensMetadataSlice";
import { GetCampaignCitizensMetadata, MintKumiCitizen, SetNewCombination } from "../../utils/web3/solana/contract.util";
import { GetVrmUrl } from "../../utils/web3/citizens.util";
import { ModelExtension } from "../../enums/export.enum";
import { Drop, LuksoMetadata, SolanaAttribute, SolanaMetadata } from "../../interfaces/citizens.interface";

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
        campaignParams?.config.skin?.defColor ?? 'FFFFFF'
      );
    }
  }

  async function onAvatarBuilderReady() {
    try {
      await Promise.all([
        getEnvironmentMapList(),
        getSingleInfo(),
        getSingleData(selectedCampaign as string, selectedCitizen?.combination as string),
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

      // Set features from single
      await loadSingleData();

      // Set skin tone
      await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'FFFFFF');

      // Set animation
      const animationResult = await GetAnimationByCampaignAndName(
        selectedCampaign,
        campaignParams?.config.defAnimation
      );

      if (animationResult.success) {
        await ChangeStartAnimation(animationResult.value.at(0)?.path);
      } else {
        LogError(Module.Citizens, 'Failed to change start animation', animationResult.errCode);
      }

      setIsAllReady(true);
    } catch (error) {
      LogError(Module.Citizens, 'Error in onAvatarBuilderReady', error);
    }
  }

  async function exportModel( type?: ModelExtension ) {
    switch (type) {
      case ModelExtension.GLB:
        return await exportGlb();
      case ModelExtension.VRM:
        return await exportVrm();
      case ModelExtension.PNG:
        return await exportImage();
      default:
        return false;
    }
  }

  async function exportGlb(): Promise<boolean> { //This function exports the glb file
    if (!selectedCitizen) return false;
    const result = await GetAvatarGLB();
    if (result.success) {
      const fileName =
        FILE_CAMPAIGN_NAME_LABEL[selectedCitizen.campaign as keyof typeof FILE_CAMPAIGN_NAME_LABEL] +
        selectedCitizen.tokenId;
      await SaveFile(result.value, `${fileName}.glb`);
      return true;
    }
    return false;
  }

  async function exportVrm(): Promise<boolean> { //This function exports the vrm file
    if (!selectedCitizen) return false;
    const vrmStorageUrl = await GetVrmUrl(selectedCitizen.campaign, selectedCitizen.combination);
    const result = await FetchBlob(vrmStorageUrl);
    if (result) {
      const fileName =
        FILE_CAMPAIGN_NAME_LABEL[selectedCitizen.campaign as keyof typeof FILE_CAMPAIGN_NAME_LABEL] +
        selectedCitizen!.tokenId;
      await SaveFile(result, `${fileName}.vrm`);
      return true;
    }
    return false;
  }


  async function exportImage(): Promise<boolean> { //This function exports the image file
    if (!selectedCitizen) return false;
    const result = await FetchBlob(selectedCitizen.imageUrl);
    if (result) {
      const fileName =
        FILE_CAMPAIGN_NAME_LABEL[selectedCitizen.campaign as keyof typeof FILE_CAMPAIGN_NAME_LABEL] +
        selectedCitizen!.tokenId;
      await SaveFile(result, `${fileName}.png`);
      return true;
    }
    return false;
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

  async function fetchSolanaMetadata(walletAddress: string): Promise<boolean> {
    const asset = await GetCampaignCitizensMetadata(walletAddress);
    if (asset.success) {
      dispatch(setCitizensMetadata(asset.value));
      dispatch(setSelectedCitizen(asset.value[0]));
      return true;
    }
    LogError(Module.Citizens, 'Failed to fetch solana metadata', asset.errCode);
    return false;
  }

  async function saveLuksoCombination() {
    const newCombination = singleInitData.current?.features
      .map((feature) => feature.val.index)
      .join('-') as string;

    if (!campaignParams) {
      LogError(Module.Citizens, 'Campaign params is undefined in Lukso saveCombination');
      return false;
    }
    if (!singleInitData.current) {
      LogError(Module.Citizens, 'Single init data is undefined in Lukso saveCombination');
      return false;
    }
    if (!selectedCitizen) {
      LogError(Module.Citizens, 'Selected citizen is undefined in Lukso saveCombination');
      return false;
    }
    if (!walletAddress) {
      LogError(Module.Citizens, 'Wallet address is undefined in Lukso saveCombination');
      return false;
    }
    if (!citizensMetadata) {
      LogError(Module.Citizens, 'Citizens metadata is undefined in Lukso saveCombination');
      return false;
    }

    const currentCampaign = selectedCampaign;

    if (!currentCampaign) {
      LogError(Module.Citizens, 'Current campaign is undefined in Lukso saveCombination');
      return false;
    }

    const currentFeatures = singleInitData.current.features;
    const newCitizenMetadata = { //Make a copy of the selected citizen metadata
      ...selectedCitizen,
      combination: newCombination,
      rawMetadata: {
        ...selectedCitizen.rawMetadata,
        combination: newCombination,
        body: {
          ...(selectedCitizen.rawMetadata as LuksoMetadata).body
        }
      } as LuksoMetadata
    }

    newCitizenMetadata.rawMetadata.attributes = []; //Reset attributes to be replaced

    const burnDropArray: BodyPart[] = [];

    currentFeatures.forEach((feature) => {
      newCitizenMetadata.rawMetadata.attributes.push({
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
      if (currentCampaign == 'vrm_female') bodyFeature = newCitizenMetadata.rawMetadata.body[FEMALE_CAMPAIGN_BODY_TYPES[feature.val.type.toLowerCase() as keyof typeof FEMALE_CAMPAIGN_BODY_TYPES] as keyof typeof newCitizenMetadata.rawMetadata.body];
      else bodyFeature = newCitizenMetadata.rawMetadata.body[feature.val.type.toLowerCase() as keyof typeof newCitizenMetadata.rawMetadata.body];

      if (bodyFeature && bodyFeature.name != feature.val.name) {
        newCitizenMetadata.rawMetadata.body[
          feature.val.type.toLowerCase() as keyof typeof newCitizenMetadata.rawMetadata.body
        ] = feature.val as BodyPart;

        burnDropArray.push(feature.val as BodyPart);
      }
    });

    const metadataObject = await UploadLuksoMetadata(
      newCitizenMetadata.rawMetadata,
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

    newCitizenMetadata.imageUrl = metadataObject.value.imageUrl;
    newCitizenMetadata.rawMetadata.imageUrl = metadataObject.value.imageUrl;

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

    updatedCitizensMetadata[index] = newCitizenMetadata;

    dispatch(setCitizensMetadata(updatedCitizensMetadata));
    dispatch(setSelectedCitizen(newCitizenMetadata));

    return true; // return true in success, false in failure
  }

  async function saveSolanaCombination() {
    const newCombination = singleInitData.current?.features
      .map((feature) => feature.val.index)
      .join('-') as string; // Save the new combination as string from features

    if (!campaignParams) {
      LogError(Module.Citizens, 'Campaign params is undefined in Kumi saveCombination');
      return false;
    }
    if (!singleInitData.current) {
      LogError(Module.Citizens, 'Single init data is undefined in Kumi saveCombination');
      return false;
    }
    if (!selectedCitizen) {
      LogError(Module.Citizens, 'Selected citizen is undefined in Kumi saveCombination');
      return false;
    }
    if (!walletAddress) {
      LogError(Module.Citizens, 'Wallet address is undefined in Kumi saveCombination');
      return false;
    }
    if (!citizensMetadata) {
      LogError(Module.Citizens, 'Citizens metadata is undefined in Kumi saveCombination');
      return false;
    }

    const currentCampaign = selectedCampaign;

    if (!currentCampaign) {
      LogError(Module.Citizens, 'Current campaign is undefined in Kumi saveCombination');
      return false;
    }

    const attributes: SolanaAttribute[] = []; //Convert from current features to attribute list 

    const oldCombinationArray = selectedCitizen.combination.split('-');
    const newCombinationArray = newCombination.split('-');
    const oldAttributes: SolanaAttribute[] = []; //This array will contain the attributes to be unequipped
    const newAttributes: SolanaAttribute[] = []; //This array will contain the attributes to be equipped
    if (userFeatures && userFeatures[selectedCampaign as string] != null) newCombinationArray.forEach((featureIndex, index) => {
        const indexType = campaignParams?.features?.[index]?.displayName; //Get the type of the feature
        if (!indexType) return undefined;

        const oldAttribute = (selectedCitizen.rawMetadata as SolanaMetadata).attributes[index]; //Get the old feature to be unequipped and transferred back to wallet if not base feature
        const newAttribute = userFeatures[currentCampaign as string].find((feature: { type: string; index: number; }) => feature.type === indexType && feature.index === parseInt(newCombinationArray[index])) as Drop; //Get the new feature to be equipped and transferred to source asset in case it's not base feature

        const attribute = newAttribute ? { //Add asset address to the attribute newAttribute exists
          trait_type: indexType.toUpperCase(),
          value: newAttribute?.name.toUpperCase(),
          asset_address: newAttribute?.contract_address
        } : {
          trait_type: indexType.toUpperCase(),
          value: singleInitData.current?.features[index]?.val.name.toUpperCase() as string, //Set the feature name to the new feature index
        }
        attributes.push(attribute); 

        if (oldCombinationArray[index] == featureIndex) return undefined; //If the new feature is the same as the old feature, skip

        if (oldAttribute && oldAttribute.asset_address) oldAttributes.push(oldAttribute); //If the old feature is not base feature, add it to the old features array. We know it's not base feature because it has an asset_address
        if (attribute && attribute.asset_address) newAttributes.push(attribute); //If the new feature is not base feature, add it to the new features array. We know it's not base feature because we get it from user features
      });

    const newCitizenMetadata = { //Make a copy of the selected citizen metadata
      ...selectedCitizen,
      combination: newCombination,
      rawMetadata: {
        ...selectedCitizen.rawMetadata,
        combination: newCombination,
        attributes,
      } as SolanaMetadata
    }

    const metadataObject = await UploadSolanaMetadata(
      newCitizenMetadata,
      newCombination,
      selectedCitizen.campaign
    );

    if (!metadataObject.success) {
      LogError(Module.Citizens, 'Failed to upload metadata on saveSolanaCombination', metadataObject.errCode);
      return false;
    }

    newCitizenMetadata.imageUrl = metadataObject.value.imageUrl;

    const result = await SetNewCombination((selectedCitizen.rawMetadata as SolanaMetadata).asset_address, metadataObject.value.uri, newAttributes, oldAttributes);

    const isFetchSuccess = await fetchSolanaMetadata(walletAddress);

    return isFetchSuccess && result.success;

  }

  async function handleSaveCombination() {
    let isSuccess = false;
    if (selectedCampaign == Campaign.Citizens || selectedCampaign == Campaign.Creators) {
      isSuccess = await saveLuksoCombination();
    } else if (selectedCampaign == Campaign.Kumi) {
      isSuccess = await saveSolanaCombination();
    }
    return isSuccess;
  }

  async function onMinting() {
    //TODO: Minting function
    if (selectedCampaign == Campaign.Kumi) {
      const mintResult = await MintKumiCitizen();
      if (mintResult.success && walletAddress) {
        const isFetchSuccess = await fetchSolanaMetadata(walletAddress);
        return isFetchSuccess;
      }
    }
    return false;
  }

  return <CitizensUI
    singleInitData={singleInitData.current}
    exportData={exportData.current}
    featureList={optionList.current}
    isReady={isAllReady}
    handleReady={() => onAvatarBuilderReady()}
    handleExport={(type) => exportModel(type)}
    handleOptionChange={(id, path, name, category) => changeFeaturefromHud(id, path, name, category)}
    handleSaveCombination={() => handleSaveCombination()}
    handleMinting={() => onMinting()}
  />
}