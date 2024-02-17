import { useConnectWallet } from '@web3-onboard/react'

interface ConnectWeb3ButtonProps {
    onConnect: () => void
    classStyles: string
    children: JSX.Element | JSX.Element[] | boolean;
}



export default function ConnectWeb3Button({ classStyles,/*  children, */ onConnect }: ConnectWeb3ButtonProps) {
    const [, connect] = useConnectWallet()

    return <>
        <button  disabled={true} className={classStyles} onClick={ () => {
            void (async ()=>{ await connect()})()
            onConnect()
            

        }}>
            <div className="flex items-center gap-3 mx-4">
                Mint will start 4:20 PM EST
                {/* {children} */}
            </div>
        </button></>
}

