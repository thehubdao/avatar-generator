import { ethers } from 'ethers';
import { useEffect, useState } from 'react';




export default function Web3Login() {
    const [etherProvider, setEtherProvider] = useState<ethers.BrowserProvider>();
    const [signer, setSigner] = useState<ethers.JsonRpcSigner>()
    useEffect(() => {
        const promise = () => { setEtherProvider(new ethers.BrowserProvider((window as any).ethereum)) }
        promise()
    }, [])
    return <>

        {etherProvider && <button onClick={async () => {
            const signer = await etherProvider.getSigner();
            setSigner(signer)
        }}>Login</button>}
    </>

}