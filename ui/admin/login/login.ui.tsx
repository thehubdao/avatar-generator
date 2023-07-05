import { FormEvent } from "react";
import AGButton from "../../common/ag-button.component";

interface LoginProps {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setUser: (value: string) => void;
  setPass: (value: string) => void;
}

export default function Login({handleSubmit, setUser, setPass} : LoginProps) {
  return (
    <main className="w-full h-screen grid grid-cols-[65%_1fr] font-work">
      <div className="bg-gray-900">
        avatar iFrame
      </div>
      <div className="bg-bg p-28">
        <div className="flex flex-col justify-between h-full">
          <div>
            <h1 className="font-poppins font-bold text-right text-5xl text-gray-dark leading-[0.8]">AVATAR<br />HUB</h1>
            <p className="text-right text-gray-light pt-4">
              administrator portal by<br />
              <a className="underline" href="https://www.thehubdao.xyz/" target="_blank" rel="noopener noreferrer">The Hub DAO</a>
            </p>
          </div>
          <div className="flex justify-end">
            <form onSubmit={event => void handleSubmit(event)} className="w-2/3 max-w-xs">
              <input className="shadow-inset-soft rounded-lg w-full py-2 px-4 mb-4 bg-bg" placeholder="User"
                type="text" required onChange={event => setUser(event.target.value)} />
              <input className="shadow-inset-soft rounded-lg w-full py-2 px-4 mb-4 bg-bg" placeholder="Password"
                type="password" required onChange={event => setPass(event.target.value)} />
              <AGButton form nm align="end">Log In</AGButton>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}