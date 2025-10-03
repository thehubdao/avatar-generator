import { Blockchain } from "../../../enums/blockchain/common.enum";
import { Campaign } from "../../../types/citizens.type";
import LoginUI from "../../../ui/citizens/login/login.ui";

interface CitizensLoginComponentProps {
    handleLogin?: (blockChain: Blockchain | undefined, campaign: Campaign | undefined) => void;
	handleGetYourCitizen: () => void;
	isModalOpen: boolean;
	handleCloseModal: () => void;
}
export default function CitizensLoginComponent({handleLogin, handleGetYourCitizen, isModalOpen, handleCloseModal}: CitizensLoginComponentProps) {
    const onLogin = (blockChain: Blockchain | undefined, campaign: Campaign | undefined) => {	
		if (handleLogin) {	
			handleLogin(blockChain, campaign);
		}
	}
    return <LoginUI handleGetYourCitizen={handleGetYourCitizen} handleLogin={onLogin} isModalOpen={isModalOpen} handleCloseModal={handleCloseModal}/>
}