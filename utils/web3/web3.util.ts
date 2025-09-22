import { PrivyClientConfig } from "@privy-io/react-auth";
import { Blockchain, LoginLibrary } from "../../enums/blockchain/common.enum";
import { Campaign } from "../../enums/citizens/common.enum";

export function BlockchainToWalletChainType(blockchain?: Blockchain): NonNullable<PrivyClientConfig['appearance']>['walletChainType'] {
    switch (blockchain) {
        case "ethereum":
            return "ethereum-only";
        case "solana":
            return "solana-only";
        default:
            return "ethereum-and-solana";
    }
}

export function SetSdkConnection(LoginLibrary?: Record<LoginLibrary, boolean>) {
    if (LoginLibrary === undefined) localStorage.removeItem("LoginLibrary");
    else localStorage.setItem("LoginLibrary", JSON.stringify(LoginLibrary));
}

export function GetSdkConnection(): Record<LoginLibrary, boolean> {
    const LoginLibrary = localStorage.getItem("LoginLibrary") as string;
    return JSON.parse(LoginLibrary) as Record<LoginLibrary, boolean>;
}

export function SetSelectedCampaign(campaign?: Campaign | null) {
    if (campaign === undefined || campaign === null) localStorage.removeItem("SelectedCampaign");
    else localStorage.setItem("SelectedCampaign", JSON.stringify(campaign));
}

export function GetSelectedCampaign(): Campaign | null {
    const selectedCampaign = localStorage.getItem("SelectedCampaign");
    if (!selectedCampaign) return null;
    try {
        return JSON.parse(selectedCampaign) as Campaign;
    } catch {
        return null;
    }
}