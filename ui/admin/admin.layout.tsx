import { Provider } from "react-redux";
import store from "../../store/store";
import Header from "./common/header.ui";

interface AdminLayoutInterface {
  children: JSX.Element | JSX.Element[] | boolean;
}

export default function Layout({ children }: AdminLayoutInterface) {
  return (
    <Provider store={store}>
      <header>
        <Header />
      </header>
      <main className="max-w-screen-xl min-h-screen m-auto py-[88px] px-8 bg-bg">
        {children}
      </main>
    </Provider>
  );
}