import { useConnectWallet } from '@web3-onboard/react'

interface ConnectWeb3ButtonProps {
    onConnect: () => void
    classStyles: string
    children: JSX.Element | JSX.Element[] | boolean;
}



export default function ConnectWeb3Button({ children, classStyles, onConnect }: ConnectWeb3ButtonProps) {
    const [, connect] = useConnectWallet()

    return <>
        <button className={classStyles} onClick={ () => {
            void (async ()=>{ 
           
                await connect()
            })()
            onConnect()
        }}>
            <div className="flex items-center">
                {children}
            </div>
        </button></>
}

