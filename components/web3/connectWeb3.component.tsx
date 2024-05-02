import { useConnectWallet } from '@web3-onboard/react'

interface ConnectWeb3ButtonProps {
    onConnect: () => void
    classStyles: string
    children: JSX.Element | JSX.Element[] | boolean;
}



export default function ConnectWeb3Button({ classStyles, children, onConnect }: ConnectWeb3ButtonProps) {
    const [, connect] = useConnectWallet()

    return <>
        <button className={classStyles} onClick={ () => {
            void (async ()=>{ 
            try{
                console.log("Connect")
                await connect()
            console.log("COnnectTT")}catch(err){console.log(err)}})()
            onConnect()
        }}>
            <div className="flex items-center gap-3 mx-4">

                {children}
            </div>
        </button></>
}

