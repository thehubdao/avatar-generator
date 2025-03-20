import { usePrivy } from "@privy-io/react-auth";
import LoginUI from "../../../ui/citizens/login/login.ui";

export default function CitizensLoginComponent() {
    const { login, ready, authenticated } = usePrivy();


    const handleLogin = () => {
        login();
    }



    return <LoginUI handleLogin={handleLogin} ready={ready} authenticated={authenticated} />
}