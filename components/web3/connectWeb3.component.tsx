import { Signer, ethers } from "ethers"
import { useEffect, useState } from "react"
import { ConnectStatus } from "../../types/web3.type"
import { ConnectionStatus } from "../../enums/web3"

interface ConnectWeb3ButtonProps {
    onConnect: (signer: Signer | undefined, status: ConnectStatus) => void
    etherProvider: ethers.BrowserProvider,
    classStyles: string
    signer: Signer | undefined
    children:JSX.Element | JSX.Element[] | boolean;
}



export default function ConnectWeb3Button({ onConnect, etherProvider, classStyles, signer,children }: ConnectWeb3ButtonProps) {
    const [address, setAdrress] = useState<string | undefined>()
    const handleConnect = async () => {
        try {
            const signer = await etherProvider.getSigner();
            const address = await signer.getAddress()
            setAdrress(address)
            onConnect(signer, ConnectionStatus.success)
        } catch (err) {
            console.log(err) //Error handling
            onConnect(undefined, ConnectionStatus.success)
        }

    }

    return <>{etherProvider &&
        <button className={classStyles} onClick={!signer ? handleConnect : undefined}>
            <div className="flex items-center gap-3 mx-4">
                {children}
            </div>
        </button>}</>
}