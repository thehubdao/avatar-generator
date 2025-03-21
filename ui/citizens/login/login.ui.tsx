import { usePrivy } from "@privy-io/react-auth";


interface CitizensLoginUIProps {
    handleLogin: () => void;
    handleLogout: () => void;
}

export default function CitizensLoginUI({ handleLogin, handleLogout }: CitizensLoginUIProps) {
    const { ready, authenticated, user } = usePrivy();

    if (!ready) {
        return <div>Loading...</div>
    }
    if (ready && !authenticated) {
        return <div onClick={handleLogin}>Poner Login UI</div>
    }
    if (ready && authenticated) {
        return <div onClick={handleLogout}>{user?.wallet?.address}</div>
    }

}
