import { PrivyClientConfig } from "@privy-io/react-auth";
import { Blockchain } from "../../enums/blockchain/common.enum";

export function blockchainToWalletChainType(blockchain?: Blockchain): NonNullable<PrivyClientConfig['appearance']>['walletChainType'] {
    switch (blockchain) {
        case "ethereum":
            return "ethereum-only";
        case "solana":
            return "solana-only";
        default:
            return "ethereum-and-solana";
    }
}