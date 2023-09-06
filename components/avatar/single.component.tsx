import {useRef} from "react";
import {
  GetAnimationByCampaignAndName,
  GetAvatarSingleByCampaignCombination, GetAvatarSingleByCampaignCombinationString
} from "../../utils/api.util";
import AvatarEditor, {ChangeFeature, ChangeSkinColor, ChangeStartAnimation, SetFeaturesData} from "./editor.component";
import {FeatureBasic, LookAtVectors} from "../../interfaces/common.interface";
import {AnimationInterface, SingleInterface} from "../../interfaces/api.interface";
import {LogError} from "../../utils/common.util";
import {Module} from "../../enums/common.enum";
import {ChangeMaterialOption} from "../../enums/model.enum";

interface AvatarSingleProps {
  campaign: string;
  combination?: number;
  combinationString?: string;
  featureList: FeatureBasic[];
  avatarBasePath: string;
  defaultAnimation?: string;
  defaultSkinTone?: string;
  defaultCameraPosition?: LookAtVectors;
  changeMaterial?: ChangeMaterialOption;
}

export default function AvatarSingle({
                                       campaign,
                                       combination, 
                                       combinationString,
                                       featureList,
                                       avatarBasePath,
                                       defaultSkinTone,
                                       defaultAnimation,
                                       defaultCameraPosition, 
                                       changeMaterial
                                     }: AvatarSingleProps) {
  const singleData = useRef<SingleInterface>();
  const defaultAnimationData = useRef<AnimationInterface>();

  async function onAvatarBuilderReady() {
    await Promise.all([
      getSingleData(),
      getAnimation()
    ]);
    
    await SetFeaturesData(featureList);

    // Set features from single
    await loadSingleData();

    // Set skin tone
    defaultSkinTone != undefined && await ChangeSkinColor(defaultSkinTone);
        
    // Set animation
    await ChangeStartAnimation(defaultAnimationData.current?.path);
  }

  async function getSingleData() {
    let result: SingleInterface | undefined;
    if (combinationString != undefined) {
      const mixStringResult = await GetAvatarSingleByCampaignCombinationString(campaign, combinationString);
      result = mixStringResult.success ? mixStringResult.value : undefined;
    }
    else {
      const numResult = await GetAvatarSingleByCampaignCombination(campaign, combination);
      result = numResult.success ? numResult.value : undefined;
    }
    
    singleData.current = result;
  }

  async function getAnimation() {
    const result = await GetAnimationByCampaignAndName(campaign, defaultAnimation);
    defaultAnimationData.current = result.success ? result.value.at(0) : undefined;
  }
  
  async function loadSingleData() {
    // Iterate the features
    // Place the features on the model
    if (singleData.current == undefined)
      return void LogError(Module.Single, "Missing single data!");
      
    for (const {val: {id, path, type, name}} of singleData.current.features) {
      // Set feature on model
      // TODO: add defSkin from campaign configuration
      await ChangeFeature(id, path, name, type, defaultSkinTone, undefined, changeMaterial);
    }
  }
  
  return (
    <>
      <AvatarEditor avatarBasePath={avatarBasePath}
                    onReady={() => onAvatarBuilderReady()}
                    changeMaterial={changeMaterial}
                    defaultCamera={defaultCameraPosition}
      />
    </>
  );
}