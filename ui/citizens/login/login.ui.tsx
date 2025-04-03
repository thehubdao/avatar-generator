import { useLogin } from "@privy-io/react-auth";
import { Blockchain } from "../../../enums/blockchain/common.enum";
import { BlockchainToWalletChainType } from "../../../utils/web3/web3.util";
import { useDispatch } from "react-redux";
import { Campaign } from "../../../enums/citizens/common.enum";
import { setSelectedCampaign } from "../../../store/citizensMetadataSlice";

export default function CitizensLoginUI() {
    const dispatch = useDispatch();
    const { login } = useLogin();

    const handleLogin = (blockchain: Blockchain) => {
        login({ walletChainType: BlockchainToWalletChainType(blockchain) }); // @NaN enviar dinámicamente el blockchain según la campaña seleccionada
        dispatch(setSelectedCampaign(Campaign.Citizens)); //Settear la campaña seleccionada
    }

    return <div onClick={() => handleLogin(Blockchain.Ethereum)}>Poner Login UI</div>
}
