import Head from "next/head";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { IsLogIn, LogIn } from "../../../utils/firebase.util";
import { FirebaseError } from "@firebase/util";
import { GoToPage } from "../../../utils/router.util";
import { PageLocation } from "../../../enums/common.enum";
import AGLoading from "../../../ui/common/ag-loading.component";
import LoginUI from "../../../ui/admin/login/login.ui";
import { Provider } from "react-redux";
import store from "../../../store/store";
import { ShowModal } from "../../../utils/modal.util";

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');

  const getLogin = useCallback(async () => {
    const isLogged = await IsLogIn();
    setIsLoading(isLogged);
    if (isLogged) {
      await GoToPage(PageLocation.Admin);
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(user && pass)) {
      ShowModal('Please insert a User and password.');
      return;
    }

    try {
      const logged = await LogIn({ user, pass });
      if (logged)
        await GoToPage(PageLocation.Admin);
    }
    catch (err) {
      const error = err as FirebaseError;
      setIsLoading(false);
      ShowModal(`LogIn error: ${error.code}`);
    }
  }

  useEffect(() => {
    const componentDidMount = async () => {
      await getLogin();
    };

    componentDidMount()
      .catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Provider store={store}>
        <LoginUI handleSubmit={onSubmit} setUser={setUser} setPass={setPass} />
      </Provider>
      <AGLoading loading={isLoading} bgColor="F1F5F9" />
    </>
  )
}