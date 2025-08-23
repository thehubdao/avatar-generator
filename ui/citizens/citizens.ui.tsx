import { useEffect, useState } from "react";
import AvatarEditor from "../../components/avatar/editor.component";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import HudUI from "../avatar/hud.ui";
import { BasicData, ExportInterface, LookAtVectors } from "../../interfaces/common.interface";
import { FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../../components/avatar/viewer.component";
import { FilterList } from "../../utils/common.util";
import { setEditMode, setMarketplaceMode, setShoppingCart } from "../../store/citizensMetadataSlice";
import DetailsUI from "./common/details.ui";
import SnackbarProvider from "./snackbar/snackbar.provider";
import MintUI from "./common/mint.ui";
import { MINTING_UI_DATA } from "../../constants/mint.constant";
import { ModelExtension } from "../../enums/export.enum";
import LoadingUI from "./common/loading.ui";
import ShoppingCartUI from "./backpack/shoppingCart.ui";
import Link from "next/link";
import Button from "./common/button.ui";

interface CitizensUIProps {
	singleInitData?: SingleInterface;
	exportData: ExportInterface;
	featureList: FeatureInterface[];
	marketplaceFeatureList?: FeatureInterface[];
	isReady: boolean;
	handleReady: () => Promise<void>;
	handleExport: (type?: ModelExtension) => Promise<boolean>;
	handleOptionChange: (id, path, name, category) => Promise<void>;
	handleSaveCombination: () => Promise<boolean>;
	handleBuying: () => Promise<boolean>;
	handleMinting: () => Promise<boolean>;
	handleResetCombination: (type?: string) => void;
}

export default function CitizensUI({ singleInitData, exportData, featureList, marketplaceFeatureList, isReady, handleReady, handleExport, handleOptionChange, handleSaveCombination, handleBuying, handleMinting, handleResetCombination }: CitizensUIProps) {
	const dispatch = useAppDispatch();
	const campaignParams = useAppSelector(state => state.citizensMetadata.campaignParameters);
	const shoppingCart = useAppSelector(state => state.citizensMetadata.shoppingCart);
	const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);
	const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
	const didEditMode = useAppSelector(state => state.citizensMetadata.editMode);
	const didMintingMode = useAppSelector(state => state.citizensMetadata.mintingMode);
	const didMarketplaceMode = useAppSelector(state => state.citizensMetadata.marketplaceMode);
	const didNotificationMode = useAppSelector(state => state.citizensMetadata.notificationMode);

	// Edit mode local State
	const [optionList, setOptionList] = useState<FeatureInterface[]>();
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [selectedOption, setSelectedOption] = useState<BasicData>();
	const [loadingTextIndex, setLoadingTextIndex] = useState(0);

	// Loading text rotation for better UX
	const loadingTexts = [
		"Loading Environment",
		"Initializing 3D Scene",
		"Loading Avatar Model",
		"Rendering Textures",
		"Setting Up Lighting",
		"Preparing Camera",
		"Almost Ready..."
	];

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
			const option = exportData.attributes.find(
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

	function onMarketOptionChange(id: string, path: string, name: string) {
		handleOptionChange(id, path, name, selectedCategory);
		onSelectedOptionChange({
			id: id,
			val: name
		});
		// Always replace the item in the shopping cart if another exists with the same category
		const updatedCart = [
			...shoppingCart.filter(item => item.detail !== selectedCategory),
			{
				id,
				val: name,
				detail: selectedCategory
			}
		];
		dispatch(setShoppingCart(updatedCart));
	}

	function onMarketOptionRemove(type?: string) {
		handleResetCombination(type);

		// Remove the item from the shopping cart if it matches the category selected
		if (type && type === selectedCategory) {
			setSelectedOption(undefined);
		}
	}

	function onCategoryChange(value: string) {
		setSelectedCategory(value);
		if (didEditMode) {
			const filteredList = FilterList(featureList, 'type', value);
			setOptionList(filteredList);
		} else if (didMarketplaceMode && marketplaceFeatureList) {
			const filteredList = FilterList(marketplaceFeatureList, 'type', value);
			setOptionList(filteredList);
		}
		updateFeatureCamPosition(value, {
			...campaignParams?.config.featuresCamPos,
			...campaignParams?.config.accCamPos,
		})
	}

	useEffect(() => {
		if (didEditMode) {
			const filteredList = FilterList(featureList, 'type', selectedCategory);
			setOptionList(filteredList);
		} else if (didMarketplaceMode && marketplaceFeatureList) {
			const filteredList = FilterList(marketplaceFeatureList, 'type', selectedCategory);
			setOptionList(filteredList);
		}
	}, [featureList, marketplaceFeatureList, didEditMode, didMarketplaceMode])

	useEffect(() => {
		if (isReady) {
			if (selectedCategory === '') {
				setSelectedCategory(exportData.attributes[0].id);
			} else {
				onSelectedOptionChange();
			}
		}
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

	useEffect(() => {
		if (!didMarketplaceMode) {
			AGChangeCamPosition(campaignParams?.config.defCam?.pos);
			AGChangeLookAtPosition(campaignParams?.config.defCam?.lookAt);
		} else {
			updateFeatureCamPosition(selectedCategory, {
				...campaignParams?.config.featuresCamPos,
				...campaignParams?.config.accCamPos,
			})
		}
	}, [didMarketplaceMode]);

	useEffect(() => {
		const interval = setInterval(() => {
			setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
		}, 1500);

		// Stop rotation when ready
		if (isReady) {
			clearInterval(interval);
		}

		return () => clearInterval(interval);
	}, [isReady]);

	return (
		<SnackbarProvider>
			{didNotificationMode ?
				<div className="w-full h-dvh flex flex-col items-center justify-center gap-2 text-white">
					<h1 className="font-bold text-2xl">No avatar yet?</h1>
					<p> Create yours now with just one click.</p>
					<Link href="https://www.thehubdao.xyz/" className="pt-4">
						<Button label="Create Avatar" light handleClick={() => { }} />
					</Link>
				</div>
				:
				<div className="w-full h-dvh text-white">
					{
						campaignParams && campaignParams !== null && selectedCitizen !== null &&
						<>
							{/* AVATAR EDITOR */}
							<div className="fixed top-0 right-0 h-dvh flex justify-end">
								<AvatarEditor
									avatarBasePath={
										campaignParams.armature
									}
									editMode={didEditMode || didMarketplaceMode}
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
							{
								didMintingMode ?
									<>
										{/* MINTING */}
										{isReady &&
											<MintUI
												imgUrl={selectedCampaign ? MINTING_UI_DATA[selectedCampaign]?.imgUrl : undefined}
												avatarDescription={selectedCampaign ? MINTING_UI_DATA[selectedCampaign]?.avatarDescription : undefined}
												campaignName={selectedCampaign ? MINTING_UI_DATA[selectedCampaign]?.campaignName : undefined}
												campaignDescription={selectedCampaign ? MINTING_UI_DATA[selectedCampaign]?.campaignDescription : undefined}
												onMinting={() => handleMinting()}
											/>
										}
									</>
									:
									<>
										{/* CITIZEN DETAILS */}
										{singleInitData && singleInitData.features.length > 0 &&
											<DetailsUI data={singleInitData.features} handleDownload={(type) => handleExport(type)} imgUrl={selectedCitizen.imageUrl} loading={false} onResetCombination={handleResetCombination} />
										}
										{/* EDIT MODE HUD */}
										{isReady &&
											<div className="fixed w-full z-50 dark">
												<HudUI
													HUDTitle="CUSTOMIZATION"
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
													hideSkinSelector={true}
													handleSaveCombination={() => handleSaveCombination()}
													changeView={() => dispatch(setEditMode(false))}
													onOptionChange={(id, path, name) => onOptionChange(id, path, name)}
													onCategoryTypeChange={(newCategory) => { onCategoryChange(newCategory) }}
													onSkinColorChange={() => { }}
													exportModel={(type) => handleExport(type)}
													isCustomCampaignHud
													onClickBackButton={() => dispatch(setEditMode(false))}
													isLoading={false}
												/>
											</div>
										}
										{/* MARKETPLACE MODE HUD */}
										{isReady &&
											<>
												<div className="fixed w-full z-50 dark">
													<HudUI
														HUDTitle="MARKETPLACE"
														selectedOption={selectedOption}
														editModeSelected={didMarketplaceMode}
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
														hideSkinSelector={true}
														changeView={() => dispatch(setMarketplaceMode(false))}
														onOptionChange={(id, path, name) => onMarketOptionChange(id, path, name)}
														onCategoryTypeChange={(newCategory) => { onCategoryChange(newCategory) }}
														onSkinColorChange={() => { }}
														exportModel={(type) => handleExport(type)}
														isCustomCampaignHud
														onClickBackButton={() => dispatch(setMarketplaceMode(false))}
														isLoading={false}
													/>
												</div>
												{!didEditMode && <ShoppingCartUI onRemoveItem={(type) => onMarketOptionRemove(type)} onCheckOut={() => handleBuying()} />}
											</>

										}
									</>
							}
						</>
					}
					{
						!isReady &&
						<LoadingUI loadingText="Loading Environment" dataValidate={null} />
					}
				</div>
			}
		</SnackbarProvider>
	)
}
