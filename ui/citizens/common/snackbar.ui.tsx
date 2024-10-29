import { ReactElement } from "react"

interface SnackbarProps {
  children: ReactElement
}

export default function Snackbar({ children }: SnackbarProps) {

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-xl bg-black/25 backdrop-blur-sm px-6 py-4 rounded-2xl">
      <div className="text-white text-center">
        {children}
      </div>
    </div>
  )
}