import { PrivyClientConfig } from "@privy-io/react-auth";
import { Blockchain, LoginLibrary } from "../../enums/blockchain/common.enum";

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