import ConnectWeb3Button from "../../../components/web3/connectWeb3.component"
import TransparentBoxUI from "./transparentBox.ui"

interface ConnectModalUIProps {
  setIsConnecting: (value: boolean) => void;
}

function ConnectModalUI({ setIsConnecting }: ConnectModalUIProps) {
  const onConnect = () => {
    setIsConnecting(false);
  }

  return (
    <div className="z-10 bg-black bg-opacity-30 w-full h-screen fixed top-0 flex justify-center items-center">
      <TransparentBoxUI fullWidth border heightClass="h-fit min-h-[240px]" backgroundColorClass="bg-[#FFCBDE]">
      
          <div className="flex flex-col justify-center items-center gap-4">
            <h3 className="text-2xl">Connect Wallet!</h3>
            <p>In order to mint a citizen must have connected the wallet to which we are going to link its asset</p>
            <ConnectWeb3Button onConnect={onConnect} classStyles="h-fit" >
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="text-black">Mint starting at 4:20PM EST</p>
                </div>
              </TransparentBoxUI>
            </ConnectWeb3Button>
          </div>
      </TransparentBoxUI>
    </div>
  )
}

export default ConnectModalUI
