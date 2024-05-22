import { useConnectWallet } from '@web3-onboard/react'

interface ConnectWeb3ButtonProps {
    onConnect: () => void
    classStyles: string
    children: JSX.Element | JSX.Element[] | boolean;
    hasSupplyReached: boolean;
}



export default function ConnectWeb3Button({ hasSupplyReached, classStyles, onConnect }: ConnectWeb3ButtonProps) {
    const [, connect] = useConnectWallet()

    return <>
        <button className={classStyles} onClick={ () => {
            void (async ()=>{ 
           
                await connect()
            })()
            onConnect()
        }}>
            <div className="flex items-center gap-3 mx-4">

            Nft supply has been reached!
            </div>
        </button></>
}

