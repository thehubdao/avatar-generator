import { useEffect, useState } from "react";
import AvatarEditor from "../../components/avatar/editor.component";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import HudUI from "../avatar/hud.ui";
import { BasicData, ExportInterface, LookAtVectors, MintUIResult } from "../../interfaces/common.interface";
import { FeatureInterface, SingleInterface } from "../../interfaces/api.interface";
import { AGChangeCamPosition, AGChangeLookAtPosition } from "../../components/avatar/viewer.component";
import { FilterList, LogError } from "../../utils/common.util";
import { setEditMode, setMarketplaceMode, setShoppingCart } from "../../store/citizensMetadataSlice";
import { RootCampaignConstant } from "../../constants/campaign.constant";
import DetailsUI from "./common/details.ui";
import SnackbarProvider from "./snackbar/snackbar.provider";
import MintUI from "./common/mint.ui";
import { MINTING_UI_DATA } from "../../constants/mint.constant";
import { ModelExtension } from "../../enums/export.enum";
import LoadingUI from "./common/loading.ui";
import Link from "next/link";
import Button from "./common/button.ui";
import { Module } from "../../enums/common.enum";
import Modal from "./common/modal.ui";
import FlashUI from "./common/flash.ui";
import ShoppingCartUI from "./backpack/shoppingCart.ui";
import { FeatureClaimableDrop } from "../../interfaces/citizens.interface";
import { AnyFeature } from "../../types/citizens.type";

interface CitizensUIProps {
	singleInitData?: SingleInterface;
	exportData: ExportInterface;
	featureList: AnyFeature[];
	marketplaceFeatureList?: FeatureClaimableDrop[];
	isReady: boolean;
	handleReady: () => Promise<void>;
	handleExport: (type?: ModelExtension) => Promise<boolean>;
	handleOptionChange: (id: string, path: string, name: string, category: string) => Promise<void>;
	handleSaveCombination: () => Promise<boolean>;
	handleBuying: () => Promise<boolean>;
	handleMinting: () => Promise<MintUIResult>;
	handleResetCombination: (type?: string) => Promise<boolean>;
}

export default function CitizensUI({ singleInitData, exportData, featureList, marketplaceFeatureList, isReady,   handleBuying,handleReady, handleExport, handleOptionChange, handleSaveCombination, handleMinting, handleResetCombination }: CitizensUIProps) {
	const dispatch = useAppDispatch();
	const campaignParams = useAppSelector(state => state.citizensMetadata.campaignParameters);
	const shoppingCart = useAppSelector(state => state.citizensMetadata.shoppingCart);
	const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);
	const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
	const didEditMode = useAppSelector(state => state.citizensMetadata.editMode);
	const didMintingMode = useAppSelector(state => state.citizensMetadata.mintingMode);
	const didMarketplaceMode = useAppSelector(state => state.citizensMetadata.marketplaceMode);
	const didNotificationMode = useAppSelector(state => state.citizensMetadata.notificationMode);
	const isTakingPhoto = useAppSelector(state => state.citizensMetadata.takingPhoto);
	const didSavingMode = useAppSelector(state => state.citizensMetadata.savingMode);

	// Edit mode local State
	const [optionList, setOptionList] = useState<AnyFeature[]>();
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

	async function onMarketOptionChange(id: string, path: string, name: string) {
		// Check if clicking on the already selected option (deselect behavior)
		if (selectedOption && selectedOption.id === id && selectedOption.val === name) {
			// Deselect: Reset to base feature
			await onMarketOptionRemove(selectedCategory);
			return;
		}

		// Find the clicked feature to check if it's limited
		const clickedFeature = marketplaceFeatureList?.find(f => f.id === id && f.name === name);
		
		// For Root Network: Block selection if limit is reached
		const isRootNetwork = selectedCampaign === RootCampaignConstant.Based;
		if (isRootNetwork && clickedFeature?.isLimitReached) {
			LogError(Module.Citizens, 'Cannot select feature: claim limit reached');
			return;
		}

		// For Root Network: Remove previous feature before adding new one
		if (isRootNetwork && shoppingCart.length > 0) {
			// Get the previous item's category
			const previousItem = shoppingCart[0];
			if (previousItem && previousItem.detail !== selectedCategory) {
				// Reset the previous category to base feature
				await handleResetCombination(previousItem.detail);
			}
		}

		// Normal selection behavior
		handleOptionChange(id, path, name, selectedCategory);
		onSelectedOptionChange({
			id: id,
			val: name
		});

		// Only add to cart if it's not limit reached (preview mode)
		if (!clickedFeature?.isLimitReached) {
			if (isRootNetwork) {
				// For Root: Only allow 1 item in cart, replace everything
				const updatedCart = [{
					id,
					val: name,
					detail: selectedCategory
				}];
				dispatch(setShoppingCart(updatedCart));
			} else {
				// For other blockchains: Replace item in same category
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
		}
	}

	async function onMarketOptionRemove(type?: string) {
		const isSuccess = await handleResetCombination(type);

		if (!isSuccess) {
			LogError(Module.Citizens, 'Error resetting combination in onMarketOptionRemove');
			return;
		}
		
		// Update shopping cart based on what was removed
		if (type) {
			// Remove only the specific item from cart
			const updatedCart = shoppingCart.filter(item => item.detail !== type);
			dispatch(setShoppingCart(updatedCart));
			
			// Find the base/original feature that was restored
			const restoredFeature = exportData.attributes.find(attr => attr.id === type);
			if (restoredFeature && type === selectedCategory) {
				setSelectedOption(restoredFeature);
			}
		} else {
			// If no type specified, reset all - clear entire cart
			dispatch(setShoppingCart([]));
			
			// Update to current category's feature
			const currentFeature = exportData.attributes.find(attr => attr.id === selectedCategory);
			setSelectedOption(currentFeature);
		}
	}

	function updateOptionList(value: string) {
		if (didEditMode) {
			const filteredList = FilterList(featureList, 'type', value);
			setOptionList(filteredList);
		} else if (didMarketplaceMode && marketplaceFeatureList) {
			const filteredList = FilterList(marketplaceFeatureList, 'type', value);
			setOptionList(filteredList);
		}
	}

	function onCategoryChange(value: string) {
		setSelectedCategory(value);
		updateOptionList(value);
		updateFeatureCamPosition(value, {
			...campaignParams?.config.featuresCamPos,
			...campaignParams?.config.accCamPos,
		})
	}

	useEffect(() => {
		updateOptionList(selectedCategory);
		// Also update selectedOption to match current feature when lists change
		if (selectedCategory) {
			const currentFeature = exportData.attributes.find(attr => attr.id === selectedCategory);
			if (currentFeature) {
				setSelectedOption(currentFeature);
			}
		}
	}, [featureList, marketplaceFeatureList, didEditMode, didMarketplaceMode, exportData.attributes])

	useEffect(() => {
		if (isReady) {
			if (selectedCategory === '') {
				setSelectedCategory(exportData.attributes[0].id);
			} else {
				onSelectedOptionChange();
			}
		}
	}, [isReady, selectedCategory])

	// Update selectedOption when switching between edit/marketplace modes
	useEffect(() => {
		if (isReady && selectedCategory) {
			const initialCategory = exportData.attributes[0].id;
			setSelectedCategory(initialCategory);
			// Sync selectedOption with current exportData when mode changes
			const currentFeature = exportData.attributes.find(attr => attr.id === initialCategory);
			if (currentFeature) {
				setSelectedOption(currentFeature);
			}
		}
	}, [didEditMode, didMarketplaceMode, isReady])

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
								{ isTakingPhoto && <FlashUI /> }
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
											<DetailsUI data={singleInitData.features} handleDownload={(type) => handleExport(type)} imgUrl={selectedCitizen.imageUrl} loading={didSavingMode} onResetCombination={handleResetCombination} />
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
												{didEditMode && shoppingCart !== null && shoppingCart.length > 0 &&
													<Modal handleClose={() => dispatch(setEditMode(false))}>
														<div className="grid justify-items-center">
															<div className="text-center text-white grid gap-4">
																<p className="font-bold text-2xl">Shopping Process</p>
																<p className="text-lg">You have items in the cart, <br />please proceed to checkout.</p>
															</div>
															<div className="grid gap-4 pt-8">
																<Button label="Continue checkout" light handleClick={() => {
																	dispatch(setEditMode(false));
																}} />
																<Button label="Clean cart" light handleClick={async () => {
																	await onMarketOptionRemove();
																	dispatch(setEditMode(false));
																}} />
															</div>
														</div>
													</Modal>
												}
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
												{!didEditMode && <ShoppingCartUI onRemoveItem={async (type) => await onMarketOptionRemove(type)} onCheckOut={() => handleBuying()} />} {/* #Marketplace button */}
											</>

										}
									</>
							}
						</>
					}
					{
						!isReady &&
						<LoadingUI loadingText={loadingTexts[loadingTextIndex]}dataValidate={null} />
					}
				</div>
			}
		</SnackbarProvider>
	)
}
