import { ConnectedChain, EIP1193Provider, WalletState } from "@web3-onboard/core"
import { useConnectWallet } from "@web3-onboard/react"
import { ethers } from "ethers"
import { useState } from "react"
import { SiweMessage } from "siwe"

interface ConnectWeb3ButtonProps {
    classStyles: string;
    setIsSigned?: (signed: boolean) => void;
    isSigned?: boolean;
    children: React.ReactNode;
}

export default function ConnectWeb3Button({ children, classStyles, setIsSigned }: ConnectWeb3ButtonProps) {
    const [{ wallet }, connect] = useConnectWallet()
    const [isConnecting, setIsConnecting] = useState(false)
    const [isSigning, setIsSigning] = useState(false)

    const handleSign = async (wallet: WalletState) => {
        if (!wallet) return


        setIsSigning(true)
        const provider = new ethers.BrowserProvider(wallet.provider as EIP1193Provider, 'any')
        const currentSigner = await provider.getSigner()
        const connectedChain = wallet.chains[0] as ConnectedChain

        const siweMessage = new SiweMessage({
            domain: window.location.host,
            address: wallet.accounts[0].address,
            statement: 'By logging in you agree to the terms and conditions.',
            uri: window.location.origin,
            version: '1',
            chainId: Number(connectedChain.id),
            resources: ['https://terms.website.com'],
        }).prepareMessage()
        console.log(siweMessage)
        try {
            if (currentSigner) {
                const signature = await currentSigner.signMessage(siweMessage)
                if (setIsSigned) {
                    setIsSigned(true);
                }
                console.log('Firma exitosa:', signature)
                setIsSigning(false)
            } else {
                console.error("No signer available")
                setIsSigning(false)
            }
        } catch (error) {
            console.error("Error al firmar:", error)
            setIsSigning(false)
        }
    }

    const handleConnect = async () => {
        if (!wallet) {
            setIsConnecting(true)
            const wallet = await connect()
            await handleSign(wallet[0])

        }
    }

    return (
        <button
            className={classStyles}
            onClick={async () => {
                await handleConnect()

            }}
            disabled={isConnecting || isSigning}
        >
            <div className="flex items-center gap-3 mx-4">
                {isConnecting ? 'Conectando...' :
                    isSigning ? 'Firmando...' :
                        wallet ? 'Firmar' : children}
            </div>
        </button>
    )
}