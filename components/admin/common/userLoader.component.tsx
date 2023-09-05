import { useEffect, useState } from "react";
import { GetCurrentUserInfo, IsLogIn } from "../../../utils/firebase.util";
import { useAppDispatch } from "../../../store/hooks";
import { connect, disconnect, setUserInfo } from "../../../store/authSlice";
import AGLoading from "../../../ui/common/ag-loading.component";

export default function UserLoader() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const componentDidMount = async () => {
      if (await IsLogIn()) {
        dispatch(connect());
      } else {
        dispatch(disconnect());
      }

      const uInfo = await GetCurrentUserInfo(true);
      if (uInfo) {
        const { role, name, account, email, campaign } = uInfo;
        void dispatch(setUserInfo({ role, name, account, email, campaign }));
      }
      setIsLoading(false);
    };

    componentDidMount().catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (<AGLoading loading={isLoading} bgColor="F1F5F9" />)
}

