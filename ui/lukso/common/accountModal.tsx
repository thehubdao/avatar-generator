import Image from "next/image";
import TransparentBoxUI from "./transparentBox.ui";
import { useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";

interface AccountModalUIProps {
  addressAccount: string;
  formatAddress: string;
  setIsAccountModalOpen: (value: boolean) => void;
  onDisconnect: () => void
}

export default function AccountModalUI({ addressAccount, formatAddress, setIsAccountModalOpen, onDisconnect }: AccountModalUIProps) {
  const [isCopyAddress, setIsCopyAddress] = useState<boolean>(false);
  const [copyAddressMessage, setCopyAddressMessage] = useState<string>("");
  const [{ wallet }, , disconnect,] = useConnectWallet()
  async function copyToClipboard(text: string): Promise<void> {
    setIsCopyAddress(true);

    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyAddressMessage("Copied on clipboard!");
      })
      .catch(() => {
        setCopyAddressMessage("Error copied on clipboard!");
      });

    await sleep(2500);
    setIsCopyAddress(false);
  }

  async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <div className="z-10 bg-black bg-opacity-30 w-full h-screen fixed top-0 flex justify-center items-center">
      <TransparentBoxUI fullWidth border heightClass="h-fit min-h-[240px]" backgroundColorClass="bg-[#FFCBDE]">
        <div className="min-w-[515px] flex flex-col gap-4 justify-center items-center">
          <Image
            src='resources/icons/campaigns/portal.svg'
            width={106}
            height={24}
            alt="Lukso icon"
          />
          <h3 className="text-2xl font-bold text-white">Account: {formatAddress}</h3>
          <div className="flex flex-wrap justify-between w-full gap-3">
            <button className="w-72 h-fit" onClick={() => { setIsAccountModalOpen(false) }}>
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="">Go Back</p>
                </div>
              </TransparentBoxUI>
            </button>
            <button className="w-72 h-fit" onClick={() => void copyToClipboard(addressAccount)}>
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="">{isCopyAddress ? copyAddressMessage : "Copy Address"}</p>
                </div>
              </TransparentBoxUI>
            </button>
            <button className="w-72 h-fit" onClick={() => {
              void (async () => {
                if (!wallet) return
                await disconnect({ label: wallet.label })
                onDisconnect()
              })()
              setIsAccountModalOpen(false)
            }}>
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="">Disconnect</p>
                </div>
              </TransparentBoxUI>
            </button>
          </div>
        </div>
      </TransparentBoxUI>
    </div>
  )
}