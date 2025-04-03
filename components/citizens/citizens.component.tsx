import { useEffect } from "react";
import { CitizensPageLocation } from "../../enums/citizens/common.enum";
import CitizensUI from "../../ui/citizens/citizens.ui"
import { GoToPage } from "../../utils/router.util";
import { useBlockchainWallet } from "../../hooks/useBlockchainWallet";

export default function CitizensComponent() {
  const { isLoggedIn } = useBlockchainWallet();

  //User Auth Check
  useEffect(() => {
    if (isLoggedIn === false)
      GoToPage(CitizensPageLocation.LOGIN);
  }, [isLoggedIn]);

  return <CitizensUI />
}
