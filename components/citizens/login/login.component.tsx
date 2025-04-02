import { useEffect } from "react";
import { CitizensPageLocation } from "../../../enums/citizens/common.enum";
import LoginUI from "../../../ui/citizens/login/login.ui";
import { GoToPage } from "../../../utils/router.util";
import { usePrivy } from "@privy-io/react-auth";

export default function CitizensLoginComponent() {
    const { ready:isPrivyProviderReady, authenticated:isUserAuthenticated } = usePrivy();

    //User Auth Check
    useEffect(() => {
        if (isPrivyProviderReady && isUserAuthenticated) {
            GoToPage(CitizensPageLocation.HOME);
        }
    }, [isPrivyProviderReady, isUserAuthenticated]);

    return <LoginUI />
}