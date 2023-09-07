import { Provider } from "react-redux";
import store from "../store/store";
import MobileBuildAlert from "../ui/admin/common/mobileBuildAlert.ui";

export default function MobileLayout({ children }: { children: JSX.Element | JSX.Element[] | boolean }) {
  <Provider store={store}>
    <main className="max-w-screen-xl min-h-screen m-auto py-[88px] px-8 bg-bg">
      <div className="hidden xl:block">{children}</div>
      <div className="block xl:hidden"><MobileBuildAlert /></div>
    </main>
  </Provider>
}