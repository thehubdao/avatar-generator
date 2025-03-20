import { usePrivy } from "@privy-io/react-auth";


interface CitizensLoginUIProps {
    handleLogin: () => void;
    ready: boolean;
    authenticated: boolean;
}

export default function CitizensLoginUI({ handleLogin}: CitizensLoginUIProps) {
    const { ready, authenticated } = usePrivy();

    if (!ready) {
        return <div>Loading...</div>
    }
    if (ready && !authenticated) {
        return <div onClick={handleLogin}>Poner Login UI</div>
    }
    if (ready && authenticated) {
        return <div>Poner Home UI</div>
    }

}
