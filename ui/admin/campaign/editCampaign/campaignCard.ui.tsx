import { AiOutlineLink } from "react-icons/ai";
import AGButton from "../../../common/ag-button.component";

interface CampaignCardInterface {
	noCampaign?: boolean;
	create?: boolean;
	campaign?: string;
	clickHandler: () => void;
}

export default function CampaignCard({ noCampaign, create, campaign, clickHandler }: CampaignCardInterface) {
	return (
		<div className={`justify-self-center rounded-2xl h-96 w-72 flex flex-col justify-center items-center ${noCampaign ? 'shadow-inset-medium hover:shadow-inset-hard' : 'shadow-flat-soft hover:shadow-flat-hard'} overflow-hidden transition-all`}>
			{noCampaign &&
				<>
					<h2 className="text-center font-bold leading-none text-gray-normal">YOU DON&apos;T<br />HAVE A CAMPAIGN</h2>
				</>
			}
			{create &&
				<>
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
				</>
			}
			{campaign &&
				<>
					<div className="w-full h-full bg-gray-dark p-2 flex flex-col justify-between">
						<div className="bg-bg w-fit px-5 py-2 rounded-xl flex justify-between items-center gap-6">
							<p className="uppercase font-poppins font-bold text-gray-normal">{campaign}</p>
							<div className="w-2 h-2 rounded-full bg-green-500"></div>
						</div>
						<div className="flex justify-end gap-2">
							<button className="bg-bg w-fit px-5 rounded-full" onClick={() => void clickHandler()}>
								<p className="py-1">Edit</p>
							</button>
							<div className="bg-bg w-fit px-2 rounded-full flex justify-between items-center">
								<AiOutlineLink />
							</div>
						</div>
					</div>
				</>
			}
		</div>
	)
}