import HeaderUI from "../ui/citizens/common/header.ui"
import { useBlockchainWallet } from "../hooks/useBlockchainWallet";
import { useAppSelector } from "../store/hooks";
import React from "react";
import CitizensLoginComponent from "../components/citizens/login/login.component";
import { BlockchainProvider } from "../contexts/BlockchainContext";
import LoadingUI from "../ui/citizens/common/loading.ui";
import { Blockchain } from "../enums/blockchain/common.enum";
import { Campaign } from "../enums/citizens/common.enum";

export default function CitizensLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactElement
}) {
  const { HandleLogin, HandleLogout, ethersProvider } = useBlockchainWallet();
  const isConnected = useAppSelector(state => state.citizensAuth.connected);

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] font-work">
      {/* Loading while waiting for login state */}
      {
        isConnected === null ?
          <LoadingUI loadingText="Loading Citizens Portal" dataValidate={isConnected}/>
          :
          <>
            <HeaderUI onLogin={() => HandleLogin(Blockchain.Root, Campaign.Based)} onLogout={() => HandleLogout()} />
            <main className="w-full min-h-dvh">
              {
                isConnected === true ?
                <BlockchainProvider ethersProvider={ethersProvider}>
                  {children}
                </BlockchainProvider>
                :
                <CitizensLoginComponent handleLogin={HandleLogin} />
              }
            </main>
          </>
      }
    </section>
  )
}