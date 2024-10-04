import { ReactElement } from "react"

interface ModalProps {
  children: ReactElement;
  handleClose: () => void;
}

export default function Modal({children, handleClose}: ModalProps) {
  return (
    <div className="fixed inset-0 w-full h-screen flex justify-center items-center">
      <div className="absolute w-full h-full bg-black/25 cursor-pointer" onClick={() => handleClose()}/>
      <div className="w-[340px] min-h-[340px] rounded-2xl border-[2px] border-white/25 bg-black/25 backdrop-blur-sm px-8 py-12">
        {children}
      </div>
    </div>
  )
}