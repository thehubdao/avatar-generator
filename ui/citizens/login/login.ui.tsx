import { useLogin } from "@privy-io/react-auth";

export default function CitizensLoginUI() {
    const { login } = useLogin();
    return <div onClick={login}>Poner Login UI</div>
}
