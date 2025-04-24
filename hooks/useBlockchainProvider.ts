import { useSolanaWallets } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { Blockchain } from "../enums/blockchain/common.enum";
import { useAppSelector } from "../store/hooks";
import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";


//DESCRIPTION: This hook is used to get the provider for the current blockchain
//TODO: Check a better way to handle the provider than using a Hook.
//NOTE: Provider cannot be stored in Redux because it is a BrowserProvider and not serializable.

export function useBlockchainProvider() {
    const blockchainType = useAppSelector(state => state.citizensAuth.blockchainType);
    const { wallets: ethereumWallets } = useWallets();
    const [provider, setProvider] = useState<BrowserProvider | null>(null);

    useEffect(() => {
        const getProviderPromise = async () => {
            if (blockchainType === Blockchain.Ethereum) {
                const provider = await ethereumWallets[0].getEthereumProvider();
                setProvider(new BrowserProvider(provider));
            } else if (blockchainType === Blockchain.Solana) {
                //TODO: Get solana provider
                setProvider(null);
            }
        }
        void getProviderPromise();
    }, [blockchainType]);

    return provider;
}