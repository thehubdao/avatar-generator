import { useEffect } from "react";
import { CitizensPageLocation } from "../../../enums/citizens/common.enum";
import LoginUI from "../../../ui/citizens/login/login.ui";
import { GoToPage } from "../../../utils/router.util";
import { useBlockchainWallet } from "../../../hooks/useBlockchainWallet";

export default function CitizensLoginComponent() {
    const { isLoggedIn } = useBlockchainWallet();

    //User Auth Check
    useEffect(() => {
        if (isLoggedIn) GoToPage(CitizensPageLocation.HOME);
        
    }, [isLoggedIn]);

    return <LoginUI />
}