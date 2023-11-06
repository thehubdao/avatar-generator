import { useState } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineDelete, AiOutlineInfoCircle, AiOutlineLoading } from "react-icons/ai";

import AGButton from "../../../common/ag-button.component";

interface CampaignCardProps {
	noCampaign?: boolean;
	create?: boolean;
	campaign?: string;
	clickHandler: () => void;
	deleteCampaign?: (campaign: string) => Promise<void>;
}

export default function CampaignCard({ noCampaign, create, campaign, clickHandler, deleteCampaign }: CampaignCardProps) {
	const [willDelete, setWillDelete] = useState<boolean>(false);
	const [shouldDeleteCampaing, setShouldDeleteCampaing] = useState<boolean>(false);

	const handleDeleteCampaign = async (campaign: string) => {
		if (deleteCampaign) {
			setShouldDeleteCampaing(true);
			try {
				await deleteCampaign(campaign);
			} finally {
				setShouldDeleteCampaing(false);
			}
		}
	}


	return (
		<div className={`justify-self-center rounded-2xl h-96 w-72 flex flex-col justify-center items-center ${noCampaign ? 'shadow-inset-medium hover:shadow-inset-hard' : 'shadow-flat-soft hover:shadow-flat-hard'} overflow-hidden transition-all`}>
			{noCampaign
				&& <>
					<h2 className="text-center font-bold leading-none text-gray-normal">YOU DON&apos;T<br />HAVE A CAMPAIGN</h2>
				</>}
			{create
				&& <>
					<h2 className="text-center font-poppins font-bold leading-none text-gray-normal">CREATE A<br />NEW CAMPAIGN</h2>
					<div>
						<div className="relative rounded-full border border-gray-light w-32 h-32 my-4">
							<div className="absolute w-3/5 h-[2px] bg-gray-light top-2/4 left-2/4 -translate-x-2/4"></div>
							<div className="absolute h-3/5 w-[2px] bg-gray-light top-2/4 left-2/4 -translate-y-2/4"></div>
						</div>
					</div>
					<AGButton nm onClickEvent={() => void clickHandler()} >
						Create
					</AGButton>
				</>}
			{campaign
				&& <>
					<div className="w-full h-full bg-gray-dark p-2 flex flex-col justify-between">
						<div className="bg-bg w-fit px-5 py-2 rounded-xl flex justify-between items-center gap-6">
							<p className="uppercase font-poppins font-bold text-gray-normal">{campaign}</p>
							<div className="w-2 h-2 rounded-full bg-green-500"></div>
						</div>
						<div className="flex justify-end gap-2">
							{shouldDeleteCampaing
								? <div className="flex items-center justify-between w-full h-8">
									<p className="pl-2 text-sm text-white">Deleting...</p>
									<div className="flex gap-2">
										<div className="bg-bg w-fit px-2 rounded-full h-8 flex justify-center items-center cursor-wait">
											<AiOutlineLoading className="animate-spin" />
										</div>
									</div>
								</div>
								: willDelete
									? <div className="flex items-center justify-between w-full h-8">
										<p className="pl-2 text-sm text-white">Are you sure?</p>
										<div className="flex gap-2">
											<div className="bg-bg w-fit px-2 rounded-full h-8 hover:text-blue flex justify-center items-center cursor-help" title="By doing so, you will no longer be able to access this campaign and the data will be permanently deleted.">
												<AiOutlineInfoCircle className="transition-all duration-300" />
											</div>
											<button className="bg-bg w-fit px-2 rounded-full h-8 hover:text-green-600"
												onClick={() => void handleDeleteCampaign(campaign)}
											>
												<AiOutlineCheckCircle className="transition-all duration-300" />
											</button>
											<button className="bg-bg w-fit px-2 rounded-full h-8 hover:text-red" onClick={() => setWillDelete(false)}>
												<AiOutlineCloseCircle className="transition-all duration-300" />
											</button>
										</div>
									</div>
									: <>
										<button className="bg-bg w-fit px-5 rounded-full h-8 flex items-center" onClick={() => void clickHandler()}>
											<p>Edit</p>
										</button>
										<button className="bg-bg w-fit px-2 rounded-full flex justify-between items-center hover:text-red" onClick={() => setWillDelete(true)}>
											<AiOutlineDelete className="transition-all duration-300" />
										</button>
									</>}
						</div>
					</div>
				</>}
		</div>
	)
}