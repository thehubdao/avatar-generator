import { Blockchain } from "../../../enums/blockchain/common.enum";
import { Campaign } from "../../../enums/citizens/common.enum";
import LoginUI from "../../../ui/citizens/login/login.ui";

interface CitizensLoginComponentProps {
    handleLogin?: (blockChain: Blockchain | undefined, campaign: Campaign | undefined) => void;
}
export default function CitizensLoginComponent({handleLogin}: CitizensLoginComponentProps) {
    const onLogin = (blockChain: Blockchain | undefined, campaign: Campaign | undefined) => {
		if (handleLogin) {
			handleLogin(blockChain, campaign);
		}
	}
    return <LoginUI handleLogin={onLogin}/>
}