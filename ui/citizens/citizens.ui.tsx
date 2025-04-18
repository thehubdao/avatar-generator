import { useEffect, useState } from "react";
import AvatarEditor from "../../components/avatar/editor.component";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import HudUI from "../avatar/hud.ui";
import { BasicData, ExportInterface, LookAtVectors } from "../../interfaces/common.interface";
import { FeatureInterface } from "../../interfaces/api.interface";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../../components/avatar/viewer.component";
import { FilterList } from "../../utils/common.util";
import { setEditMode } from "../../store/citizensMetadataSlice";

interface CitizensUIProps {
	exportData: ExportInterface;
	featureList: FeatureInterface[];
	isReady: boolean;
	handleReady: () => Promise<void>;
	handleExport: () => Promise<void>;
	handleOptionChange: (id, path, name, category) => Promise<void>;
}

export default function CitizensUI({ exportData, featureList, isReady, handleReady, handleExport, handleOptionChange }: CitizensUIProps) {
	const dispatch = useAppDispatch();
	const campaignParams = useAppSelector(state => state.citizensMetadata.campaignParameters);
	const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);
	const didEditMode = useAppSelector(state => state.citizensMetadata.editMode);

	// Local State
	const [optionList, setOptionList] = useState<FeatureInterface[]>();
	const [selectedCategory, setSelectedCategory] = useState<string>('head');
	const [selectedOption, setSelectedOption] = useState<BasicData>();

	function updateFeatureCamPosition(
		index: string,
		posLocation?: Record<string, LookAtVectors>
	) {
		const confRef = posLocation ? posLocation[index] : undefined
		if (confRef == undefined) return

		AGChangeCamPosition(confRef.pos)
		AGChangeLookAtPosition(confRef.lookAt)
	}

	function onSelectedOptionChange() {
		const option = exportData?.attributes.find(
			(e) => e.id === selectedCategory
		)		
		setSelectedOption(option);
	}

	function onOptionChange(id: string, path: string, name: string) {
		onSelectedOptionChange();
		handleOptionChange(id, path, name, selectedCategory);
	}

	function onCategoryChange(value: string) {
		setSelectedCategory(value);
		const filteredList = FilterList(featureList, 'type', value);
		if (filteredList) setOptionList(filteredList);
		updateFeatureCamPosition(value, {
			...campaignParams?.config.featuresCamPos,
			...campaignParams?.config.accCamPos,
		})
	}

	useEffect(() => {
		const filteredList = FilterList(featureList, 'type', selectedCategory);
		setOptionList(filteredList);
	}, [featureList])

	useEffect(() => {		
		onSelectedOptionChange();
	}, [isReady, selectedCategory])

	return (
		<div className="w-full h-dvh text-white">
			{
				campaignParams && campaignParams !== null && selectedCitizen !== null &&
				<>
					<div className="fixed top-0 right-0 h-dvh flex justify-end">
						<AvatarEditor
							avatarBasePath={
								campaignParams.armature
							}
							editMode={didEditMode}
							lights={
								campaignParams.config.lights
							}
							defaultShadow={
								campaignParams.config
									.defShadow
							}
							defaultCamera={
								campaignParams.config.defCam
							}
							postProcessing={
								campaignParams.config
									.postProcessing
							}
							onReady={() => {
								return handleReady();
							}
							}
						/>
					</div>
					{isReady &&
						<div className="fixed w-full z-50 dark">
							<HudUI
								selectedOption={selectedOption}
								editModeSelected={didEditMode}
								selectListCategory={
									(campaignParams.features &&
										campaignParams.accessories && [
											...campaignParams.features,
											...campaignParams.accessories,
										]) ||
									[]
								}
								optionList={optionList}
								selectedCategory={selectedCategory}
								campaignSkinColorConfig={
									campaignParams?.config.skin ||
									{}
								}
								skinColor={'#FFFFFF'}
								//TODO: Save combination
								changeView={() => dispatch(setEditMode(false))}
								onOptionChange={(id, path, name) => onOptionChange(id, path, name)}
								onCategoryTypeChange={(newCategory) => { onCategoryChange(newCategory) }}
								onSkinColorChange={() => { }}
								exportModel={() => handleExport()}
								isCustomCampaignHud
								onClickBackButton={() => dispatch(setEditMode(false))}
								isLoading={false}
							/>
						</div>
					}
				</>

			}
			{
				!isReady &&
				<div className="fixed inset-0 w-full h-dvh flex justify-center items-center bg-gradient-to-b from-[#151515] to-[#0C0C0C]">
					<h1 className="text-white text-2xl">Loading Environment...</h1>
				</div>
			}
		</div>
	)
}
