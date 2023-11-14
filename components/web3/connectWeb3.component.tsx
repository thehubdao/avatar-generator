import { Signer, ethers } from "ethers"
import TransparentBox from "../../ui/lukso/common/transparentBox.ui"
import { useEffect, useState } from "react"
import { ConnectStatus } from "../../types/web3.type"
import { ConnectionStatus } from "../../enums/web3"

interface ConnectWeb3ButtonProps {
    label: string
    switchLoading: () => void
    onConnect: (signer: Signer | undefined, status: ConnectStatus) => void
}



export default function ConnectWeb3Button({ label, onConnect, switchLoading }: ConnectWeb3ButtonProps) {
    const [etherProvider, setEtherProvider] = useState<ethers.BrowserProvider>();

    const handleConnect = async () => {
        if (!etherProvider) return
        try {
            const signer = await etherProvider.getSigner();
            switchLoading()
            onConnect(signer, ConnectionStatus.success)
        } catch (err) {
            console.log(err) //Error handling
            onConnect(undefined, ConnectionStatus.success)
        }

    }

    useEffect(() => {
        const setEtherProviderPromise = () => {
            const lukso = (window as any).lukso
            setEtherProvider(new ethers.BrowserProvider(lukso))
        }
        setEtherProviderPromise()
    }, [])

    useEffect(() => {
        if (!etherProvider) return
        switchLoading()
    }, [etherProvider])

    return <button className="w-full h-fit relative h-full w-full mr-[25%] ml-[25%]" onClick={handleConnect}>
        <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
            <div className="flex items-center gap-3">
                {label}
            </div>
        </TransparentBox>
    </button>
}