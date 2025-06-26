import { InitializeContractEssentialData } from "../../../constants/root/contract.constant";
import { GetAdminSigner } from "../../../utils/web3/root/contract.util";

const adminSigner = GetAdminSigner();
InitializeContractEssentialData(undefined, adminSigner);