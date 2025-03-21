import { usePrivy, useLogout } from "@privy-io/react-auth";

export default function CitizensUI() {
    const { user } = usePrivy();
    const { logout } = useLogout();

    return <div>
        <h1>Poner Aquí Citizens UI</h1>
        <p>{user?.wallet?.address}</p>
        <button onClick={logout}>Logout</button>
    </div>
}
