import { useEffect } from "react";
import { CitizensPageLocation } from "../../enums/citizens/common.enum";
import CitizensUI from "../../ui/citizens/citizens.ui"
import { GoToPage } from "../../utils/router.util";
import { usePrivy } from "@privy-io/react-auth";

export default function CitizensComponent() {
  const { ready, authenticated } = usePrivy();

  //User Auth Check
  useEffect(() => {
    if (ready && !authenticated) {
      GoToPage(CitizensPageLocation.LOGIN);
    }
  }, [ready, authenticated]);

  return <CitizensUI />
}
