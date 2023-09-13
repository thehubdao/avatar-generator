import Image from "next/image";
import LuksoUI from "../../ui/lukso/lukso.ui";
import TransparentBox from "../../ui/common/transparentBox.ui";
import MobileLayout from "../../layouts/mobile.layout";
import { CampaignParameters } from "../../interfaces/common.interface";
import AvatarEditor, { ChangeFeature, ChangeSkinColor, ChangeStartAnimation, SetFeaturesData } from "../avatar/editor.component";
import { SingleInterface } from "../../interfaces/api.interface";
import { useRef } from "react";
import { GetAnimationByCampaignAndName, GetAvatarSingleByCampaignCombination } from "../../utils/api.util";
import { LogError } from "../../utils/common.util";
import { Module } from "../../enums/common.enum";
import { Client } from "../../enums/client.enum";

export default function LuksoComponent({ campaignParams }: { campaignParams?: CampaignParameters }) {
  const singleData = useRef<SingleInterface>();

  async function onAvatarBuilderReady() {
    await Promise.all([
      getSingleData(),
    ]);

    await SetFeaturesData(campaignParams?.features ?? []);

    // Set features from single
    await loadSingleData();

    // Set skin tone
    await ChangeSkinColor(campaignParams?.config.skin?.defColor ?? 'ffffff');

    // Set animation
    const result = await GetAnimationByCampaignAndName(Client.Lukso, campaignParams?.config.defAnimation);
    if (result.success) {
      await ChangeStartAnimation(result.value.at(0)?.path);
    }
  }

  async function getSingleData() {
    let result: SingleInterface | undefined;
    const numResult = await GetAvatarSingleByCampaignCombination(Client.Lukso);
    result = numResult.success ? numResult.value : undefined;
    singleData.current = result;
  }

  async function loadSingleData() {
    // Iterate the features
    // Place the features on the model
    if (singleData.current == undefined)
      return void LogError(Module.Lukso, "Missing single data!");

    for (const { val: { id, path, type, name } } of singleData.current.features) {
      // Set feature on model
      // TODO: add defSkin from campaign configuration
      await ChangeFeature(id, path, name, type, campaignParams?.config.skin?.defColor ?? 'ffffff');
    }
  }

  async function reRoll() {
    await getSingleData();
    await loadSingleData();
  }

  return (
    <MobileLayout>
      <div className="w-full h-screen bg-[#FABCE2] flex flex-col">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          opacityPercentage="50"
          borderColorClass="border-white"
          borderSizeClass="border-2"
          heightClass="h-14"
          paddingClass="px-11"
          alignItemsClass="items-stretch"
        >
          <Image
            src='/resources/icons/campaigns/lukso.svg'
            width={106}
            height={24}
            alt="Lukso icon"
          />
        </TransparentBox>
        <div className="fixed">
          {/* <HudComponent
            selectedOption={selectedOpc.find(e => e.id === selectedCategory)}

            editModeSelected={isEditModeSelected}

            selectListCategory={[...selectListFeatures, ...selectListAccessories]}

            // optionList
            optionList={optionListShow}

            // selectedCategory
            selectedCategory={selectedCategory}

            campaignSkinColorConfig={campaignConfig.skin || {}}
            skinColor={skinColor}
            changeView={() => {
              setIsEditModeSelected(!isEditModeSelected);
              void updateStage(!isEditModeSelected);
            }}

            // changeCategory
            onOptionChange={(id: string, path: string, name: string) => void onOptionChange(id, path, name)}

            // onCategoryChange
            onCategoryTypeChange={(value: string) => onCategoryTypeChange(value)}
            onSkinColorChange={(value: string) => void onClickChangeSkinColor(value)}
            exportModel={() => void exportModel()}
          /> */}
          {campaignParams && <AvatarEditor
            avatarBasePath={campaignParams.armature}
            editMode={false}
            onReady={() => onAvatarBuilderReady()}
          />}
        </div>
        <LuksoUI reRoll={reRoll} />
      </div>
    </MobileLayout>
  )
}