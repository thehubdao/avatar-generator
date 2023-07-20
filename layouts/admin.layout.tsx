import { Provider } from "react-redux";
import store from "../store/store";
import MobileBuildAlert from "../ui/admin/common/mobileBuildAlert.ui";
import Header from "../components/admin/common/header.component";
import { Suspense } from "react";

interface AdminLayoutProps {
  children: JSX.Element | JSX.Element[] | boolean;
}

export default function Layout({ children }: AdminLayoutProps) {
  return (
    <Provider store={store}>
      <header className="hidden xl:block">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      </header>
      <main className="max-w-screen-xl min-h-screen m-auto py-[88px] px-8 bg-bg">
        <div className="hidden xl:block">{children}</div>
        <div className="block xl:hidden"><MobileBuildAlert /></div>
      </main>
    </Provider>
  );
}