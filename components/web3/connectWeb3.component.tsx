import { ConnectedChain, EIP1193Provider, WalletState } from "@web3-onboard/core"
import { useConnectWallet } from "@web3-onboard/react"
import { ethers } from "ethers"
import { SiweMessage } from "siwe"

interface ConnectWeb3ButtonProps {
    classStyles: string;
    setIsSigned: (signed: boolean) => void;
    isSigned?: boolean;
    children: React.ReactNode;
    setIsConnecting: (connecting: boolean) => void;
    setIsSigning: (signing: boolean) => void;
    setIsVerifying: (verifying: boolean) => void;   
    isConnecting: boolean;
    isSigning: boolean;
    isVerifying: boolean;   
}

export default function ConnectWeb3Button({ children, classStyles, setIsSigned,setIsConnecting,setIsSigning,setIsVerifying, isConnecting,isSigning,isVerifying  }: ConnectWeb3ButtonProps) {
    const [{ wallet }, connect] = useConnectWallet()

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
            nonce: await CreateNonce(),
            resources: ['https://terms.website.com'],
        })

        const message = siweMessage.prepareMessage()

        try {
            if (currentSigner) {
                const signature = await currentSigner.signMessage(message)
                setIsSigning(false)
                setIsVerifying(true)

                const response = await fetch('/api/v1/auth/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        address: wallet.accounts[0].address.toLocaleLowerCase(),
                        message,
                        signature
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setIsSigned(true);
                        console.log('Login successful and JWT token generated!')
                    } else {
                        console.error('Login successful, but failed to generate JWT token:', data.message)
                    }
                } else {
                    console.error('Failed to verify authentication')
                }


                setIsVerifying(false)
            } else {
                console.error("No signer available")
                setIsSigning(false)
            }
        } catch (error) {
            console.error("Error signing or verifying:", error)
            setIsSigning(false)
            setIsVerifying(false)
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
            disabled={isConnecting || isSigning || isVerifying}
        >
            <div className="flex items-center gap-3">
                {children}
            </div>
        </button>
    )
}

async function CreateNonce(): Promise<string> {
    return Math.random().toString(36).substring(2, 15)
}