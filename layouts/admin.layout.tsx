import { Provider } from "react-redux";
import store from "../store/store";
import MobileBuildAlert from "../ui/admin/common/mobileBuildAlert.ui";
import Header from "../components/admin/common/header.component";
import { Suspense, useEffect } from "react";
import { HandleNotLoggedIn } from "../utils/firebase.util";
import UserLoader from "../components/admin/common/userLoader.component";

interface AdminLayoutProps {
  children: JSX.Element | JSX.Element[] | boolean;
}

export default function Layout({ children }: AdminLayoutProps) {
  useEffect(() => {
    const componentDidMount = async () => {
      await HandleNotLoggedIn();
    };

    componentDidMount().catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Provider store={store}>
      <header className="hidden xl:block">
        <Suspense fallback={null}>
          <Header />
          <UserLoader />
        </Suspense>
      </header>
      <main className="max-w-screen-xl min-h-screen m-auto py-[88px] px-8 bg-bg">
        <div className="hidden xl:block">{children}</div>
        <div className="block xl:hidden"><MobileBuildAlert /></div>
      </main>
    </Provider>
  );
}