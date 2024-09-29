import { Provider } from "react-redux";
import store from "../store/store";
import MobileBuildAlert from "../ui/admin/common/mobileBuildAlert.ui";

interface MobileLayoutProps {
  children: JSX.Element | JSX.Element[] | boolean;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <Provider store={store}>
      <main className="w-full h-screen">
        <div className="hidden xl:block">{children}</div>
        <div className="flex justify-center items-center h-full xl:hidden"><MobileBuildAlert /></div>
      </main>
    </Provider>
  )
}