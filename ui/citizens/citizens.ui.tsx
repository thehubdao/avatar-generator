import { useEffect, useState } from "react";
import AvatarEditor from "../../components/avatar/editor.component";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import HudUI from "../avatar/hud.ui";
import { BasicData, ExportInterface, LookAtVectors } from "../../interfaces/common.interface";
import { FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../../components/avatar/viewer.component";
import { FilterList } from "../../utils/common.util";
import { setEditMode } from "../../store/citizensMetadataSlice";
import DetailsUI from "./common/details.ui";
import SnackbarProvider from "./snackbar/snackbar.provider";
import MintUI from "./common/mint.ui";
import { useBlockchainWallet } from "../../hooks/useBlockchainWallet";
interface CitizensUIProps {
	singleInitData?: SingleInterface;
	exportData: ExportInterface;
	featureList: FeatureInterface[];
	isReady: boolean;
	handleReady: () => Promise<void>;
	handleExport: () => Promise<void>;
	handleOptionChange: (id, path, name, category) => Promise<void>;
	handleSaveCombination: () => Promise<boolean>;
	handleMinting: () => Promise<boolean>;
}

export default function CitizensUI({ singleInitData, exportData, featureList, isReady, handleReady, handleExport, handleOptionChange, handleSaveCombination, handleMinting }: CitizensUIProps) {
	const dispatch = useAppDispatch();
	const campaignParams = useAppSelector(state => state.citizensMetadata.campaignParameters);
	const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);
	const didEditMode = useAppSelector(state => state.citizensMetadata.editMode);
	const didMintingMode = useAppSelector(state => state.citizensMetadata.mintingMode);

	useBlockchainWallet();

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

	function onSelectedOptionChange(opt?: BasicData) {
		if (opt) {
			setSelectedOption(opt);
		} else {
			const option = exportData?.attributes.find(
				(e) => e.id === selectedCategory
			)
			setSelectedOption(option);
		}
	}

	function onOptionChange(id: string, path: string, name: string) {
		handleOptionChange(id, path, name, selectedCategory);
		onSelectedOptionChange({
			id: id,
			val: name
		});
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

	useEffect(() => {
		if (!didEditMode) {
			AGChangeCamPosition(campaignParams?.config.defCam?.pos)
			AGChangeLookAtPosition(campaignParams?.config.defCam?.lookAt)
		} else {
			updateFeatureCamPosition(selectedCategory, {
				...campaignParams?.config.featuresCamPos,
				...campaignParams?.config.accCamPos,
			})
		}
	}, [didEditMode])

	return (
		<SnackbarProvider>
			<div className="w-full h-dvh text-white">
				{
					campaignParams && campaignParams !== null &&
					<>
						{/* AVATAR EDITOR */}
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
					</>
				}
			</div>
		</SnackbarProvider>
	)
}
