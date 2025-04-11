import HeaderUI from "../ui/citizens/common/header.ui"
import { useBlockchainWallet } from "../hooks/useBlockchainWallet";
import { useAppSelector } from "../store/hooks";
import React from "react";
import CitizensLoginComponent from "../components/citizens/login/login.component";

export default function CitizensLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactElement
}) {
  const { HandleLogin, HandleLogout } = useBlockchainWallet();

  const isConnected = useAppSelector(state => state.citizensAuth.connected);

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-[#151515] to-[#0C0C0C] font-work">
      {/* Loading while waiting for login state */}
      {
        isConnected === null ?
          <div className="flex justify-center items-center h-screen">
            <h1 className="text-white text-2xl">Loading Citizens Portal...</h1>
          </div>
          :
          <>
            <HeaderUI onLogin={() => HandleLogin(undefined, undefined)} onLogout={() => HandleLogout()} />
            <main className="w-full min-h-dvh">
              {
                isConnected === true ?
                children
                :
                <CitizensLoginComponent handleLogin={HandleLogin} />
              }
            </main>
          </>
      }
    </section>
  )
}