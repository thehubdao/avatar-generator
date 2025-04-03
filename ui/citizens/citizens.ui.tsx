import { usePrivy, useLogout } from "@privy-io/react-auth";
import { useDispatch } from "react-redux";
import { resetCitizensMetadata } from "../../store/citizensMetadataSlice";

export default function CitizensUI() {
    const dispatch = useDispatch();
    const { user } = usePrivy();
    const { logout } = useLogout();

    const handleLogout = () => {
        logout();
        dispatch(resetCitizensMetadata()); // Reset the citizens metadata state
    }

    return <div>
        <h1>Poner Aquí Citizens UI</h1>
        <p>{user?.wallet?.address}</p>
        <button onClick={handleLogout}>Logout</button>
    </div>
}
