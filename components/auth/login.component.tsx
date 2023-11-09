import { ethers } from 'ethers';
import { ReactNode, useEffect, useState } from 'react';

interface Web3LoginButtonProps {
    children: ReactNode;
}


export default function Web3LoginButton({ children }: Web3LoginButtonProps) {
    const [etherProvider, setEtherProvider] = useState<ethers.BrowserProvider>();
    const [signer, setSigner] = useState<ethers.JsonRpcSigner>()
    useEffect(() => {
        const promise = () => { setEtherProvider(new ethers.BrowserProvider((window as any).ethereum)) }
        promise()
    }, [])
    return <>
        {etherProvider && <span onClick={async () => {
            console.log("HOLA")
            const signer = await etherProvider.getSigner();
            setSigner(signer)
        }}>{children}</span>}
    </>

}