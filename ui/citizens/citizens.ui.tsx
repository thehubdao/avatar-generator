import AvatarEditor from "../../components/avatar/editor.component";
import { useAppSelector } from "../../store/hooks";

interface CitizensUIProps {
	isReady: boolean;
	handleReady: () => Promise<void>;
}

export default function CitizensUI({ isReady, handleReady }: CitizensUIProps) {
	const campaignParams = useAppSelector(state => state.citizensMetadata.CampaignParameters);
	const selectedCitizen = useAppSelector(state => state.citizensMetadata.selectedCitizen);

	return (
		<div className="w-full min-h-[calc(100dvh_-_96px)] grid items-center text-white">
			{
				campaignParams && campaignParams !== null && selectedCitizen !== null &&
				<div className="fixed inset-0 w-full h-dvh flex justify-center items-center">
					<AvatarEditor
						avatarBasePath={
							campaignParams.armature
						}
						editMode={false}
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
