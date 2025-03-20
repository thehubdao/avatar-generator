import { usePrivy } from "@privy-io/react-auth";
import LoginUI from "../../../ui/citizens/login/login.ui";

export default function CitizensLoginComponent() {
    const { login, logout } = usePrivy();


    const handleLogin = () => {
        login();
    }

    const handleLogout = () => {
        logout();
    }



    return <LoginUI handleLogin={handleLogin} handleLogout={handleLogout} />
}