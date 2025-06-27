import Image from "next/image";
import Link from "next/link";
import PrivacyPolicySVG from "../common/SVG/privacyPolicySVG.ui";
import TermsOfServicesSVG from "../common/SVG/termsOfServicesSVG.ui";
import SocialButtons from "../common/socialButtons.ui";
import CampaignList from "./campaignList.ui";
import { LOGIN_COLLECTIONS } from "../../../constants/citizens.constant";
import NewsUI from "./news.ui";
import FreshDropsUI from "./freshDrops.ui";
import CommunityContent from "./communityContent.ui";
import BackedBy from "./backedBy.ui";
import { Blockchain } from "../../../enums/blockchain/common.enum";
import { Campaign } from "../../../enums/citizens/common.enum";


interface CitizensLoginUIProps {
	handleLogin: (blockChain: Blockchain | undefined, campaign: Campaign | undefined) => void;
}

export default function CitizensLoginUI({handleLogin}: CitizensLoginUIProps) {

	return (
		<div className="w-full min-h-screen pt-20">
			<div className="pt-[8vh] 2xl:pt-[6vh] min-h-screen">
				{/* LANDING CARD */}
				<div className="relative w-full px-6">
					{/* BACKGROUND */}
					<div className="relative w-full h-[45vh] md:h-[72vh] overflow-hidden rounded-3xl md:rounded-[58px]">
						<Image src={'/resources/images/citizens/login/background.jpg'} fill alt="" priority className="object-cover object-top md:object-[0%_15%] brightness-90" />
					</div>
					{/* CITIZEN IMAGE */}
					<div className="hidden lg:block absolute bottom-0 right-0 xl:right-6 w-[75vh] xl:w-[80vh] h-[75vh] xl:h-[80vh] overflow-hidden rounded-[58px] xl:z-10">
						<Image src={'/resources/images/citizens/login/background-citizen.png'} fill alt="" className="object-cover object-[0%_15%]" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
					</div>

					{/* CONTENT */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 lg:-translate-x-0 lg:left-20 -translate-y-1/2 px-6">
						{/* TITLE */}
						<h1 className="font-monument text-[53px] md:text-[120px] 2xl:text-[170px] text-white text-center leading-[0.8]"><span className="text-[46px] md:text-[104px] 2xl:text-[150px]">CITIZENS</span><br /> PORTAL</h1>
						{/* TEXT */}
						<p className="text-[15px] lg:text-[34px] 2xl:text-[48px] text-white text-center leading-none">Fully on-chain avatar platform</p>
						{/* BUTTON */}
						<div className="w-full flex justify-center pt-6">
							<button type="button" className="w-fit h-16 bg-white rounded-[28px] px-10 md:px-24 font-light text-2xl" onClick={() => handleLogin(undefined, undefined)}>
								GET YOUR CITIZEN
							</button>
						</div>
					</div>
				</div>
				{/* CAMPAIGNS */}
				<div>
					<h2 className="font-monument text-3xl md:text-[64px] text-white text-center pb-12 pt-20">CAMPAIGNS</h2>
					<CampaignList collections={LOGIN_COLLECTIONS} handleClick={handleLogin} />
				</div>
				{/* FRESH DROPS */}
				{ false && // Temporarily disabled
					<div className="xl:pt-12 px-6">
					{/* TABLE */}
					<div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
						{/* TABLE TITLE */}
						<h2 className="font-monument text-3xl md:text-[64px] text-white text-center pb-8 pt-10 border-b-[1px] border-white/10">FRESH DROPS</h2>
						{/* NEWS LIST */}
						<FreshDropsUI setSelectedCampaign={(blockChain, campaign) => handleLogin(blockChain, campaign)} />
					</div>
					</div>
				}
				{/* COMMUNITY CONTENT */}
				<div>
					<h2 className="font-monument text-3xl md:text-[64px] text-white text-center pb-12 pt-20 leading-none">COMMUNITY CONTENT</h2>
					<CommunityContent />
				</div>
				{/* WHATS NEW */}
				<div className="xl:pt-12 px-6">
					{/* TABLE */}
					<div className="shadow-citizens-btn bg-citizens-dark rounded-2xl my-8">
						{/* TABLE TITLE */}
					<h2 className="font-monument text-3xl md:text-[64px] text-white text-center pb-8 pt-10 border-b-[1px] border-white/10">WHATS NEW?</h2>
					{/* NEWS LIST */}
					<NewsUI />
				</div>
			</div>
				{/* BACKED BY */}
				<div className="pb-[15vh]">
					<h2 className="font-monument text-3xl md:text-[64px] text-white text-center pb-12 pt-48">BACKED BY</h2>
					<BackedBy />
				</div>
				{/* FOOTER */}
				<footer className="w-full border-t-[1px] border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 p-6">
					<div className="flex gap-4 items-center">
						<Link href={''} target="_blank" className="flex flex-col items-center gap-2">
							<PrivacyPolicySVG />
							<p className="font-light text-sm text-white text-center">
								Privacy<br />Policy
							</p>
						</Link>
						<Link href={''} target="_blank" className="flex flex-col items-center gap-2">
							<TermsOfServicesSVG />
							<p className="font-light text-sm text-white text-center">
								Terms of<br />Service
							</p>
						</Link>
					</div>
					<div>
						<p className="font-light text-sm text-white">Creador Labs UG. All rights reserved</p>
					</div>
					<div>
						<SocialButtons className='flex gap-4' />
					</div>
				</footer>
			</div>
		</div>
	)
}
