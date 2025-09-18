import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import CitizensUI from "../../ui/citizens/citizens.ui";
import { FetchBlob, GetAnimationByCampaignAndName, GetAssetsListByCampaign, GetAvatarSingleByCampaignCombinationString, GetEnvMapListByCampaign, RequestBurnDrops, RequestClaimApprove } from "../../utils/api.util";
import { EnvMapInterface, FeatureInterface, IndexFeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { ChangeFeature, ChangeStartAnimation, GetAvatarGLB, SetEnvironment, SetFeaturesData, ChangeSkinColor, GetAvatarPhoto } from "../avatar/editor.component";
import { LogError } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { ExportInterface, MintUIResult } from "../../interfaces/common.interface";
import { SaveFile } from "../../utils/exporter.util";
import { GetImageUrl, SetImageUrl, UploadLuksoMetadata, UploadPolygonMetadata, UploadSolanaMetadata } from "../../utils/metadata.util";
import { ClaimAndSetAvatarNewWearings, GetCampaignsTokensMetadata, GetLuksoUserFeatures, SetAvatarNewWearings } from "../../utils/web3/lukso/contract.util";
import { Campaign, CampaignBaseCombination, CampaignBaseUrl, PolygonCampaign, RootCampaign } from "../../enums/citizens/common.enum";
import { setCitizensMetadata, setSelectedCitizen, setTakingPhoto, setUserFeatures } from "../../store/citizensMetadataSlice";
import { GetCampaignDrops, GetVrmUrl } from "../../utils/web3/citizens.util";
import { ModelExtension } from "../../enums/export.enum";
import { GetRootAssetsMetadata, GetRootUserFeatureAssets, MintRootAsset, SetRootNewCombination } from "../../utils/web3/root/contract.util";
import { Drop, LuksoMetadata, SolanaAttribute, SolanaMetadata, LuksoAttribute, LuksoDrop, ClaimableDrop, DropToClaim, RootDrop, RootMetadata, PolygonDrop, PolygonMetadata, PolygonTrait } from "../../interfaces/citizens.interface";
import { DropType } from "../../enums/lukso/common.enum";
import { GetCollectionDocs } from "../../utils/firebase.util";
import { useBlockchainProvider } from "../../contexts/BlockchainContext";
import { AppCampaigns, CampaignDrops } from "../../types/citizens.type";
import { Result } from "../../types/common.type";
import { Vector3 } from "three";
import { StoreAssetData } from "../../utils/firebase.util";
import { AssetData } from "../../interfaces/firebase.interface";
import { GetCampaignCitizensMetadata, MintKumiCitizen, SetNewCombination } from "../../utils/web3/solana/contract.util";
import { RootErrorCode } from "../../enums/root/common.enum";
import { GetCampaignsPolygonTokensMetadata, GetPolygonUserFeatureAssets, MintPolygonCitizen, SetPolygonNewCombination } from "../../utils/web3/polygon/contract.util";
import { CAMPAIGN_UNIVERSAL_PAGE_LABELS, FILE_CAMPAIGN_NAME_LABEL } from "../../constants/labels.constant";

export default function CitizensComponent() {
  const dispatch = useAppDispatch();
  // REDUX State
  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const campaignParams = useAppSelector(state => state.citizensMetadata.campaignParameters);
  const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);
  const userFeatures = useAppSelector(state => state.citizensMetadata.userFeatures);
  const claimableDrops = useAppSelector(state => state.citizensMetadata.claimableDrops);
  const walletAddress = useAppSelector(state => state.citizensAuth.address);
  const citizensMetadata = useAppSelector(state => state.citizensMetadata.citizensMetadata);
  const shoppingCart = useAppSelector(state => state.citizensMetadata.shoppingCart);
  const isMarketplaceMode = useAppSelector(state => state.citizensMetadata.marketplaceMode);

  // Local references
  const singleInitData = useRef<SingleInterface>();
  const initialFeaturesData = useRef<IndexFeatureInterface[] | null>(null);
  const exportData = useRef<ExportInterface>({ attributes: [] });
  const featureList = useRef<FeatureInterface[]>([]);
  const optionList = useRef<FeatureInterface[]>([]);
  const claimableDropsList = useRef<ClaimableDrop[]>([]);
  const claimableDropsFeatureList = useRef<FeatureInterface[]>([]);
  const envMapList = useRef<EnvMapInterface[]>();

  const browserProvider = useBlockchainProvider();

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

  async function getFeatureList(combination?: string, basecombination?: string, _userFeatures = userFeatures) {
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

    const combinationIndexes = combination ? combination.split('-') : selectedCitizen.combination.split('-');
    const baseCombinationIndexes = basecombination ? basecombination.split('-') : selectedCitizen.baseCombination.split('-');
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

    if (!_userFeatures) return LogError(Module.Citizens, 'Missing user features to add!');

    const campaignuserFeatures = _userFeatures[selectedCampaign as string];

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
        feature.balance = _userFeatures[selectedCampaign as string].find(w => w.type === feature.type && w.index === feature.index)?.balance;
        return feature;
      });

      filteredOptionList = filteredOptionList.concat(featuresWithBalance);
    }
    optionList.current = filteredOptionList;

    if (!claimableDrops) return LogError(Module.Citizens, 'Missing claimable drops to add!');

    const campaignClaimableDrops = claimableDrops[selectedCampaign as string];
    claimableDropsList.current = campaignClaimableDrops;

    if (campaignClaimableDrops) {
      const formattedClaimableDrops = campaignClaimableDrops
        .map((drop) => (
          featureList.current?.find(
            (option) =>
              option.type === drop.featureType &&
              drop.featureIndex === option.index
          )
        ))
        .filter(el => el !== undefined);

      const claimableDropsWithMarketData = formattedClaimableDrops.map(feature => {
        feature.price = claimableDrops[selectedCampaign as string].find(w => w.featureType === feature.type && w.featureIndex === feature.index)?.price;
        feature.paymentType = claimableDrops[selectedCampaign as string].find(w => w.featureType === feature.type && w.featureIndex === feature.index)?.paymentType;
        feature.requiredXP = claimableDrops[selectedCampaign as string].find(w => w.featureType === feature.type && w.featureIndex === feature.index)?.requiredXP;
        feature.thumb = claimableDrops[selectedCampaign as string].find(w => w.featureType === feature.type && w.featureIndex === feature.index)?.imageUrl;
        return feature;
      })

      claimableDropsFeatureList.current = claimableDropsWithMarketData;
    }
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

  async function loadSingleData(specificType?: string) {
    if (selectedCitizen === null) {
      LogError(Module.Citizens, 'Missing selected citizen to load single data!');
      return;
    }
    if (!singleInitData.current) {
      LogError(Module.Citizens, 'Missing single data!');
      return;
    }
    const changeFeaturePromises = singleInitData.current.features.map(async (feature) => {
      const { id, path, type, name } = feature.val;
      if (specificType && specificType !== type) return; // Skip if specificType is provided and does not match the feature type
      await ChangeFeature(id, path, name, type, campaignParams?.config.skin?.defColor ?? 'FFFFFF');
    });
    await Promise.all(changeFeaturePromises);
  }

  async function onAvatarBuilderReady() {
    try {
      await Promise.all([
        getEnvironmentMapList(),
        getSingleInfo(),
        getSingleData(selectedCampaign as string, selectedCitizen?.combination as string),
      ]);

      if (!initialFeaturesData.current && singleInitData.current) {
        initialFeaturesData.current = structuredClone(singleInitData.current.features);
      }

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
      await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'FFFFFF', campaignParams?.config.skin?.materialName);

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

  async function exportModel(type?: ModelExtension) {
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

  async function generateImage(pos?: Vector3, target?: Vector3): Promise<string | null> {
    // @GabCh155: this function is to generate the image from the canvas
    const imageUrl = await GetAvatarPhoto(pos, target, selectedCampaign as string, () => dispatch(setTakingPhoto(true)));
    return imageUrl;
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
    const changedFeature = featureList.current.find( //We take the changed feature from the full feature list because the user does not have the feature on its balance
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

  async function fetchRootMetadata(walletAddress: string): Promise<boolean> {
    const asset = await GetRootAssetsMetadata(walletAddress);

    if (asset.success) {
      dispatch(setCitizensMetadata(asset.value));
      dispatch(setSelectedCitizen(asset.value[0]));
      return true;
    }
    LogError(Module.Citizens, 'Failed to fetch solana metadata', asset.errCode);
    return false;
  }

  async function fetchPolygonMetadata(walletAddress: string): Promise<boolean> {
    const asset = await GetCampaignsPolygonTokensMetadata(walletAddress);
    if (asset.success) {
      dispatch(setCitizensMetadata(asset.value));
      dispatch(setSelectedCitizen(asset.value[0]));
      return true;
    }
    LogError(Module.Citizens, 'Failed to fetch polygon metadata', asset.errCode);
    return false;
  }

  async function fetchPolygonUserFeatureAssets(walletAddress: string, campaign: PolygonCampaign): Promise<boolean> {
    const result = await GetPolygonUserFeatureAssets(walletAddress, campaign);
    if (result.success) {
      dispatch(setUserFeatures(result.value as CampaignDrops<AppCampaigns>));
      return true;
    }
    LogError(Module.Citizens, 'Failed to fetch polygon user feature assets', result.errCode);
    return false;
  }

  async function fetchLuksoUserFeatures(walletAddress: string): Promise<Result<CampaignDrops<AppCampaigns>>> {
    const userFeatures = await GetLuksoUserFeatures(walletAddress);
    if (userFeatures.success) {
      dispatch(setUserFeatures(userFeatures.value as CampaignDrops<AppCampaigns>));
      return { success: true, value: userFeatures.value as CampaignDrops<AppCampaigns> };
    }
    LogError(Module.Citizens, 'Failed to fetch user features', userFeatures.errCode);
    return { success: false, errMessage: userFeatures.errMessage, errCode: userFeatures.errCode };
  }

  async function fetchLuksoMetadata(walletAddress: string): Promise<boolean> {
    if (!selectedCitizen) {
      LogError(Module.Citizens, 'Selected citizen is undefined in fetchLuksoMetadata');
      return false;
    }
    const asset = await GetCampaignsTokensMetadata(walletAddress);
    if (asset.success) {
      dispatch(setCitizensMetadata(asset.value));
      const currentCitizen = asset.value.find(citizen => citizen.tokenId === selectedCitizen.tokenId);
      if (currentCitizen) {
        dispatch(setSelectedCitizen(currentCitizen));
      } else {
        LogError(Module.Citizens, 'Current citizen not found in fetched metadata');
      }
      return true;
    }
    LogError(Module.Citizens, 'Failed to fetch lukso metadata');
    return false;
  }

  async function fetchRootUserFeatureAssets(walletAddress: string, campaign: RootCampaign): Promise<boolean> {
    const result = await GetRootUserFeatureAssets(walletAddress, campaign);

    if (result.success) {
      dispatch(setUserFeatures(result.value as CampaignDrops<AppCampaigns>));
      return true;
    }
    LogError(Module.Citizens, 'Failed to fetch root user feature assets', result.errCode);
    return false;
  }

  async function saveLuksoCombination(dropsToClaim?: DropToClaim[]) { // Pass in userFeatures in case we need to update just before executing this function
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

    const oldCitizenMetadata = selectedCitizen.rawMetadata as LuksoMetadata;

    const newCitizenMetadata = { //Make a copy of the selected citizen metadata
      ...selectedCitizen,
      combination: newCombination,
      baseCombination: selectedCitizen.baseCombination,
      rawMetadata: {
        name: oldCitizenMetadata.name,
        description: oldCitizenMetadata.description,
        attributes: oldCitizenMetadata.attributes,
        images: oldCitizenMetadata.images,
        combination: newCombination,
        baseCombination: selectedCitizen.baseCombination ? selectedCitizen.baseCombination : selectedCitizen.combination, //Some metadatas does not have basecombination, for these cases we set a base combination as combination
        body: {
          ...(selectedCitizen.rawMetadata as LuksoMetadata).body
        }
      } as LuksoMetadata
    }

    newCitizenMetadata.rawMetadata.attributes = []; //Reset attributes to be replaced

    const burnDropArray: LuksoDrop[] = [];

    const attributes: LuksoAttribute[] = []; //Convert from current features to attribute list

    const oldCombinationArray = selectedCitizen.combination.split('-');
    const newCombinationArray = newCombination.split('-');
    const oldAttributes: LuksoAttribute[] = []; //This array will contain the attributes to be unequipped
    const newAttributes: LuksoAttribute[] = []; //This array will contain the attributes to be equipped

    const allDrops: Drop[] = await GetCollectionDocs(`campaign/${selectedCampaign}/drops`) as Drop[];

    if (userFeatures && userFeatures[selectedCampaign as string] != null) newCombinationArray.forEach((newIndex, index) => {
      const indexType = campaignParams?.features?.[index]?.displayName; //Get the type of the feature
      const oldIndex = oldCombinationArray[index];

      if (!indexType) return undefined;

      const newDrop: LuksoDrop = (isMarketplaceMode ? allDrops.find((feature: { type: string; index: number; }) => feature.type === indexType && feature.index === parseInt(newIndex)) : userFeatures[currentCampaign].find((feature: { type: string; index: number; }) => feature.type === indexType && feature.index === parseInt(newIndex))) as LuksoDrop; //Get the old feature to be unequipped and transferred back to wallet if not base feature

      const key = CAMPAIGN_UNIVERSAL_PAGE_LABELS[
        currentCampaign
      ][indexType.toLowerCase()];

      const newAttribute: LuksoAttribute = newDrop && newDrop.dropType === DropType.LSP8 ? { //Add asset address to the attribute newAttribute exists
        key,
        value: newDrop?.name,
        type: 'string',
        wearable_address: dropsToClaim ? dropsToClaim.find(drop => drop.wearableIndex === newIndex && drop.wearableType === indexType)?.wearableAddress : newDrop?.contract_address, //If the user is gonna claim the drop, we use predicted data
        wearable_token_id: dropsToClaim ? dropsToClaim.find(drop => drop.wearableIndex === newIndex && drop.wearableType === indexType)?.wearablePredictedTokenId : newDrop?.tokenId //If the user is gonna claim the drop, we use predicted data
      } : {
        key,
        value: singleInitData.current?.features[index]?.val.name as string, //Set the feature name to the new feature index
        type: 'string',
      }

      const oldAttribute: LuksoAttribute | undefined = oldCitizenMetadata.attributes.find(attr => attr.key === newAttribute.key);

      attributes.push(newAttribute);

      if (oldIndex === newIndex) return undefined;

      if (newDrop && newDrop.contract_address) {
        if (newDrop.dropType === DropType.LSP8) newAttributes.push(newAttribute);
        else burnDropArray.push(newDrop);
      } //If the old feature is not base feature, add it to the old features array. We know it's not base feature because it has a token id and contract address
      if (oldAttribute && oldAttribute.wearable_address && oldAttribute.wearable_token_id) {
        oldAttributes.push(oldAttribute);
      } //If the new feature is not base feature and has contract address and token id, add it to the new features array.
    });

    newCitizenMetadata.rawMetadata.attributes = attributes;

    const cameraPosition = new Vector3(0, 1.6, 1.3); // Camera position for the lukso campaign
    const cameraTarget = new Vector3(0, 1.4, 0); // Camera target for the lukso campaign
    const newImageUrl = await generateImage(cameraPosition, cameraTarget);

    if (newImageUrl) await SetImageUrl(selectedCitizen.campaign, newCombination, newImageUrl);

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

    const signer = await browserProvider?.ethersProvider?.getSigner();

    if (!signer) {
      LogError(Module.Citizens, 'Signer is undefined in saveLuksoCombination');
      return false;
    }

    if (isMarketplaceMode && dropsToClaim) {
      const claimResult = await ClaimAndSetAvatarNewWearings(currentCampaign, dropsToClaim, oldAttributes, newAttributes, selectedCitizen.tokenId, metadataObject.value.uri, signer);
      if (!claimResult.success) {
        LogError(Module.Citizens, 'Failed to claim and set new wearings', claimResult.errCode);
        return false;
      }
    } else {
      const setResult = await SetAvatarNewWearings(
        currentCampaign,
        oldAttributes,
        newAttributes,
        selectedCitizen.tokenId,
        metadataObject.value.uri,
        signer
      );

      if (!setResult.success) {
        LogError(Module.Citizens, 'Failed to set new wearings', setResult.errCode);
        return false;
      }
    }

    await RequestBurnDrops(burnDropArray, walletAddress, currentCampaign);

    const isMetadataFetchSuccess = await fetchLuksoMetadata(walletAddress);
    const userFeaturesResult = await fetchLuksoUserFeatures(walletAddress);

    if (!userFeaturesResult.success) {
      LogError(Module.Citizens, 'Failed to fetch user features in saveLuksoCombination');
      return false;
    }

    await getFeatureList(newCitizenMetadata.combination, newCitizenMetadata.baseCombination, userFeaturesResult.value);

    return isMetadataFetchSuccess; // return true in success, false in failure
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
      LogError(Module.Citizens, 'Failed to upload metadata on saveSolanaCombination', metadataObject.errMessage);
      return false;
    }

    newCitizenMetadata.imageUrl = metadataObject.value.imageUrl;

    const setNewCombinationResult = await SetNewCombination((selectedCitizen.rawMetadata as SolanaMetadata).asset_address, metadataObject.value.uri, newAttributes, oldAttributes);

    if (!setNewCombinationResult.success) {
      LogError(Module.Citizens, 'Failed to set new combination on saveSolanaCombination', setNewCombinationResult.errMessage);
      return false;
    }

    const isFetchSuccess = await fetchSolanaMetadata(walletAddress);

    return isFetchSuccess && setNewCombinationResult.value;

  }


  async function savePolygonCombination(): Promise<boolean> {
    const newCombination = singleInitData.current?.features
      .map((feature) => feature.val.index)
      .join('-') as string;

    if (!campaignParams) {
      LogError(Module.Citizens, 'Campaign params is undefined in Root saveCombination');
      return false;
    }
    if (!singleInitData.current) {
      LogError(Module.Citizens, 'Single init data is undefined in Root saveCombination');
      return false;
    }
    if (!selectedCitizen) {
      LogError(Module.Citizens, 'Selected citizen is undefined in Root saveCombination');
      return false;
    }
    if (!walletAddress) {
      LogError(Module.Citizens, 'Wallet address is undefined in Root saveCombination');
      return false;
    }
    if (!citizensMetadata) {
      LogError(Module.Citizens, 'Citizens metadata is undefined in Root saveCombination');
      return false;
    }

    const currentCampaign = selectedCampaign;

    if (!currentCampaign) {
      LogError(Module.Citizens, 'Current campaign is undefined in Root saveCombination');
      return false;
    }

    const newCitizenMetadata = { //Make a copy of the selected citizen metadata
      ...selectedCitizen,
      combination: newCombination,
      rawMetadata: {
        ...selectedCitizen.rawMetadata,
        combination: newCombination,
      } as PolygonMetadata
    }

    const newCombinationArray = newCombination.split('-');
    const oldCombinationArray = selectedCitizen.combination.split('-');
    const newAttributes: PolygonDrop[] = [];
    const oldAttributes: PolygonDrop[] = [];

    const allDropsResult = await GetCampaignDrops<PolygonDrop>(selectedCampaign);

    if (!allDropsResult.success) {
      LogError(Module.Citizens, 'Failed to get all drops on savePolygonCombination', allDropsResult.errMessage);
      return false;
    }

    const allDrops = allDropsResult.value;

    const traits: PolygonTrait[] = [];

    if (userFeatures && userFeatures[selectedCampaign] != null) newCombinationArray.forEach((newIndex, index) => {
      const indexType = campaignParams?.features?.[index]?.displayName; //Get the type of the feature
      const oldIndex = oldCombinationArray[index]; //Get the type of the feature

      if (!indexType) return undefined;

      const newDrop = userFeatures[currentCampaign].find((feature: { type: string; index: number; }) => feature.type === indexType && feature.index === parseInt(newIndex)) as PolygonDrop; //Get the new feature to be equipped
      const oldDrop = allDrops.find((feature: { type: string; index: number; }) => feature.type === indexType && feature.index === parseInt(oldIndex)) as PolygonDrop; //Get the old feature to be unequipped

      const traitIndex = newCitizenMetadata.rawMetadata.traits.findIndex((trait) => trait.trait_type.toLowerCase() === indexType.toLowerCase());
      const oldTrait = newCitizenMetadata.rawMetadata.traits[traitIndex];

      const trait = newDrop ? { //Add asset address to the attribute newAttribute exists
        trait_type: indexType.toUpperCase(),
        value: newDrop?.name.toUpperCase(),
        wearableAddress: newDrop?.contract_address,
        wearableTokenId: newDrop?.tokenId
      } : {
        trait_type: indexType.toUpperCase(),
        value: singleInitData.current?.features[index]?.val.name.toUpperCase() as string, //Set the feature name to the new feature index
      }

      traits.push(trait);

      if (oldIndex == newIndex) return undefined;
      if (newDrop && newDrop.index != 0) newAttributes.push(newDrop);
      if (oldDrop && oldDrop.index != 0) oldAttributes.push({ ...oldDrop, contract_address: oldTrait.wearableAddress as string, tokenId: oldTrait.wearableTokenId as number });
    });

    newCitizenMetadata.rawMetadata.traits = traits;

    const cameraPosition = new Vector3(0, 1.6, 1.3); // Camera position for the polygon campaign
    const cameraTarget = new Vector3(0, 1.4, 0); // Camera target for the polygon campaign
    const newImageUrl = await generateImage(cameraPosition, cameraTarget);

    if (newImageUrl) await SetImageUrl(selectedCitizen.campaign, newCombination, newImageUrl);

    const metadataObject = await UploadPolygonMetadata(
      newCitizenMetadata,
      newCombination,
      selectedCitizen.campaign
    );

    if (!metadataObject.success) {
      LogError(Module.Citizens, 'Failed to upload metadata on savePolygonCombination', metadataObject.errMessage);
      return false;
    }

    newCitizenMetadata.imageUrl = metadataObject.value.imageUrl;

    const setNewCombinationResult = await SetPolygonNewCombination(selectedCitizen.tokenId, metadataObject.value.uri, oldAttributes, newAttributes);

    if (!setNewCombinationResult.success) {
      LogError(Module.Citizens, 'Failed to set new combination on savePolygonCombination', setNewCombinationResult.errMessage);
      return false;
    }
    const isMetadataFetchSuccess = await fetchPolygonMetadata(walletAddress);
    const isUserFeatureFetchSuccess = await fetchPolygonUserFeatureAssets(walletAddress, PolygonCampaign.Polygon);

    return isMetadataFetchSuccess && isUserFeatureFetchSuccess;
  }

  async function saveRootCombination(): Promise<boolean> {
    const newCombination = singleInitData.current?.features
      .map((feature) => feature.val.index)
      .join('-') as string;

    if (!campaignParams) {
      LogError(Module.Citizens, 'Campaign params is undefined in Root saveCombination');
      return false;
    }
    if (!singleInitData.current) {
      LogError(Module.Citizens, 'Single init data is undefined in Root saveCombination');
      return false;
    }
    if (!selectedCitizen) {
      LogError(Module.Citizens, 'Selected citizen is undefined in Root saveCombination');
      return false;
    }
    if (!walletAddress) {
      LogError(Module.Citizens, 'Wallet address is undefined in Root saveCombination');
      return false;
    }
    if (!citizensMetadata) {
      LogError(Module.Citizens, 'Citizens metadata is undefined in Root saveCombination');
      return false;
    }

    const currentCampaign = selectedCampaign;

    if (!currentCampaign) {
      LogError(Module.Citizens, 'Current campaign is undefined in Root saveCombination');
      return false;
    }

    const newCombinationArray = newCombination.split('-');
    const oldCombinationArray = selectedCitizen.combination.split('-');
    const newAttributes: RootDrop[] = [];
    const oldAttributes: RootDrop[] = [];

    if (userFeatures && userFeatures[selectedCampaign] != null) newCombinationArray.forEach((newIndex, index) => {
      const indexType = campaignParams?.features?.[index]?.displayName; //Get the type of the feature
      const oldIndex = oldCombinationArray[index]; //Get the type of the feature

      if (!indexType) return undefined;

      if (oldIndex == newIndex) return undefined;

      const newAttribute = userFeatures[currentCampaign].find((feature: { type: string; index: number; }) => feature.type === indexType && feature.index === parseInt(newIndex)) as RootDrop; //Get the new feature to be equipped
      const oldAttribute = (selectedCitizen.rawMetadata as RootMetadata).attributes?.find((feature: { type: string; index: number; }) => feature.type === indexType && feature.index === parseInt(oldIndex)) as RootDrop; //Get the old feature to be unequipped

      if (newAttribute) newAttributes.push(newAttribute);
      if (oldAttribute) oldAttributes.push(oldAttribute);
    });

    const setNewCombinationResult = await SetRootNewCombination(selectedCitizen.tokenId, newAttributes, oldAttributes);

    if (!setNewCombinationResult.success) {
      LogError(Module.Citizens, 'Failed to set new combination on saveRootCombination', setNewCombinationResult.errMessage);
      return false;
    }

    const cameraPosition = new Vector3(0, 0.5, 1.3);
    const cameraTarget = new Vector3(0, 1, 0);
    const generatedImageUrl = await generateImage(cameraPosition, cameraTarget);

    await SetImageUrl(selectedCitizen.campaign, newCombination, generatedImageUrl as string);

    const attributesUnion = [...(selectedCitizen.rawMetadata as RootMetadata).attributes, ...newAttributes];

    const filteredAttributes = attributesUnion.filter((attr) => !oldAttributes.find((oldAttr) => oldAttr.collectionId === attr.collectionId));

    const castedAttributes = filteredAttributes.map((attr) => {
      return {
        collectionId: attr.collectionId,
        name: attr.name,
        schemaPart: attr.schemaPart,
        type: attr.type,
        index: attr.index,
      };
    });
    const imageUrl = await GetImageUrl(selectedCitizen.campaign, newCombination);

    const storeAssetDataResult = await StoreAssetData({
      imageUrl,
      tokenId: selectedCitizen.tokenId,
      collectionId: (selectedCitizen.rawMetadata as RootMetadata).collectionId,
      campaign: currentCampaign,
      combination: newCombination,
      attributes: castedAttributes,
    } as AssetData);

    if (!storeAssetDataResult.success) {
      LogError(Module.Citizens, 'Failed to store asset data on saveRootCombination', storeAssetDataResult.errMessage);
      return false;
    }
    const isMetadataFetchSuccess = await fetchRootMetadata(walletAddress);
    const isUserFeatureFetchSuccess = await fetchRootUserFeatureAssets(walletAddress, RootCampaign.Based);

    return isMetadataFetchSuccess && isUserFeatureFetchSuccess;
  }

  async function handleSaveCombination() {
    let isSuccess = false;
    if (selectedCampaign == Campaign.Citizens || selectedCampaign == Campaign.Creators) {
      isSuccess = await saveLuksoCombination();
    } else if (selectedCampaign == Campaign.Kumi) {
      isSuccess = await saveSolanaCombination();
    } else if (selectedCampaign == Campaign.Based) {
      isSuccess = await saveRootCombination();
    } else if (selectedCampaign == Campaign.Polygon) {
      isSuccess = await savePolygonCombination();
    }
    return isSuccess;
  }
  async function onLuksoBuying() {
    const signer = await browserProvider?.ethersProvider?.getSigner();
    if (!signer) {
      LogError(Module.Citizens, 'Signer is undefined in onBuying');
      return false;
    }
    const _claimableDropsList = claimableDropsList.current;

    if (!_claimableDropsList) {
      LogError(Module.Citizens, 'Claimable drops are undefined in onBuying');
      return false;
    }

    const claimableDrops: ClaimableDrop[] = []

    for (let i = 0; i < shoppingCart.length; i++) {
      const basicData = shoppingCart[i];

      const claimableDropFound = _claimableDropsList.find(drop => drop.featureName === basicData.val);

      if (!claimableDropFound) {
        LogError(Module.Citizens, 'Claimable drop not found in claimable drops list in onBuying');
        return false;
      }

      const claimableDrop: ClaimableDrop = claimableDropFound;

      if (!claimableDrop) {
        LogError(Module.Citizens, 'Claimable drop not found in claimable drops list in onBuying');
        return false;
      }

      claimableDrops.push(claimableDrop);
    }
    const claimResult = await RequestClaimApprove(claimableDrops, signer.address);

    if (!claimResult.success) {
      LogError(Module.Citizens, 'Failed to claim drop in onBuying', claimResult.errCode);
      return false;
    }

    return await saveLuksoCombination(claimResult.value);
  }

  async function onRootBuying() {
    return false;
  }

  async function onBuying(): Promise<boolean> {
    let isSuccess = false;
    if (selectedCampaign == Campaign.Citizens || selectedCampaign == Campaign.Creators) {
      isSuccess = await onLuksoBuying();
    }
    else if (selectedCampaign == Campaign.Based) {
      isSuccess = await onRootBuying();
    }
    return isSuccess;
  }

  async function onMinting(): Promise<MintUIResult> {
    if (!walletAddress) {
      LogError(Module.Citizens, 'Wallet address is undefined in onMinting');
      return { success: false, message: "We can't do the process right now, try again later!" };
    }

    if (selectedCampaign == Campaign.Kumi) {
      const mintResult = await MintKumiCitizen();
      if (mintResult.success && walletAddress) {
        const isFetchSuccess = await fetchSolanaMetadata(walletAddress);
        return { success: isFetchSuccess, message: isFetchSuccess ? 'Your citizen has been claimed!' : "We can't do the process right now, try again later!" };
      }
      else return { success: false, message: "We can't do the process right now, try again later!" };
    } else if (selectedCampaign == Campaign.Based) {

      const mintResult = await MintRootAsset(walletAddress, CampaignBaseCombination.Based, CampaignBaseUrl.Based);
      if (mintResult.success) {
        const isFetchSuccess = await fetchRootMetadata(walletAddress);
        return { success: isFetchSuccess, message: isFetchSuccess ? 'Your citizen has been claimed!' : "We can't do the process right now, try again later!" };
      } else if (mintResult.errCode === RootErrorCode.InsufficientFunds) {
        return { success: false, message: "Insufficient funds" + mintResult.errMessage };
      }
      else return { success: false, message: "We can't do the process right now, try again later!" };
    } else if (selectedCampaign == Campaign.Polygon) {
      const mintResult = await MintPolygonCitizen(walletAddress);
      if (mintResult.success) {
        const isFetchSuccess = await fetchPolygonMetadata(walletAddress);
        return { success: isFetchSuccess, message: isFetchSuccess ? 'Your citizen has been claimed!' : "We can't do the process right now, try again later!" };
      }
      else return { success: false, message: "We can't do the process right now, try again later!" };
    }
    return { success: false, message: "We can't do the process right now, try again later!" };
  }

  async function onResetFeature(type?: string): Promise<boolean> {

    if (!initialFeaturesData.current) {
      LogError(Module.Citizens, 'Initial export data is undefined in onResetCombination');
      return false;
    }

    if (type) {
      const initialAttribute = initialFeaturesData.current.find(attr => attr.val.type === type);

      if (initialAttribute) {
        await ChangeFeature(initialAttribute.val.id, initialAttribute.val.path, initialAttribute.val.name, type, campaignParams?.config.skin?.defColor ?? 'FFFFFF');
        addReplaceAttribute(initialAttribute.val.type, initialAttribute.val.name);
        return true;
      } else {
        LogError(Module.Citizens, `Initial attribute for type ${type} not found in onResetCombination`);
        return false;
      }
    } else {
      for (const initialAttribute of initialFeaturesData.current) {
        await ChangeFeature(initialAttribute.val.id, initialAttribute.val.path, initialAttribute.val.name, initialAttribute.val.type, campaignParams?.config.skin?.defColor ?? 'FFFFFF');
        addReplaceAttribute(initialAttribute.val.type, initialAttribute.val.name);
      }
      return true;
    }
  }

  return <CitizensUI
    singleInitData={singleInitData.current}
    exportData={exportData.current}
    featureList={optionList.current}
    marketplaceFeatureList={claimableDropsFeatureList.current}
    isReady={isAllReady}
    handleReady={() => onAvatarBuilderReady()}
    handleExport={(type) => exportModel(type)}
    handleOptionChange={(id, path, name, category) => changeFeaturefromHud(id, path, name, category)}
    handleSaveCombination={() => handleSaveCombination()}
    handleBuying={() => onBuying()}
    handleMinting={() => onMinting()}
    handleResetCombination={(type) => onResetFeature(type)}
  />
}