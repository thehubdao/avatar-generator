import { BrowserProvider, Signer } from "ethers"
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component"
import TransparentBoxUI from "./transparentBox.ui"
import { ConnectionStatus } from "../../../enums/web3"

interface ConnectModalUIProps {
  onConnect: (signer: Signer | undefined, status: ConnectionStatus) => void;
  etherProvider?: BrowserProvider;
  signer?: Signer;
  setIsConnecting: (value: boolean) => void;
}

function ConnectModalUI({ onConnect, etherProvider, signer, setIsConnecting }: ConnectModalUIProps) {
  const handleConnect = (signer: Signer | undefined, status: ConnectionStatus) => {
    onConnect(signer, status);
    setIsConnecting(false);
  }

  return (
    <div className="z-10 bg-black bg-opacity-30 w-full h-screen fixed top-0 flex justify-center items-center">
      <TransparentBoxUI fullWidth border heightClass="h-fit min-h-[240px]" backgroundColorClass="bg-[#FFCBDE]">
        {etherProvider ? (
          <div className="flex flex-col justify-center items-center gap-4">
            <h3 className="text-2xl">Connect Wallet!</h3>
            <p>In order to mint a citizen must have connected the wallet to which we are going to link its asset</p>
            <ConnectWeb3Button onConnect={handleConnect} etherProvider={etherProvider} signer={signer} classStyles="h-fit" >
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="text-black">Connect to Roll your Avatar</p>
                </div>
              </TransparentBoxUI>
            </ConnectWeb3Button>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center gap-4">
            <h3 className="text-2xl">Oops!</h3>
            <p>Can't connect ur browser with the Ethers Provider</p>
            <button className="w-52 h-fit" onClick={() => { setIsConnecting(false) }}>
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="text-black">Go Back</p>
                </div>
              </TransparentBoxUI>
            </button>
          </div>
        )}
      </TransparentBoxUI>
    </div>
  )
}

export default ConnectModalUI
