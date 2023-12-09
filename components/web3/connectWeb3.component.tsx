import { Signer, ethers } from "ethers"
import { ConnectStatus } from "../../types/web3.type"
import { ConnectionStatus } from "../../enums/web3"
import { useConnectWallet } from '@web3-onboard/react'

interface ConnectWeb3ButtonProps {
    onConnect: (signer: Signer | undefined, status: ConnectStatus) => void
    classStyles: string
    signer: Signer | undefined
    children:JSX.Element | JSX.Element[] | boolean;
}



export default function ConnectWeb3Button({ onConnect, classStyles,children }: ConnectWeb3ButtonProps) {
    const [{ wallet, connecting }, connect] = useConnectWallet()

    return <>
        <button className={classStyles} onClick={()=>connect() }>
            <div className="flex items-center gap-3 mx-4">
                {children}
            </div>
        </button></>
}

