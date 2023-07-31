import { MutableRefObject, useRef } from "react";
import NewUserButtonUI from "./NewUserButton.ui";

//** Represents the props for the NewUser component.
interface NewUserProps {
  handleCreateNewUser: (
    userAccount: MutableRefObject<HTMLInputElement | null>,
    userName: MutableRefObject<HTMLInputElement | null>,
    userPass: MutableRefObject<HTMLInputElement | null>
  ) => Promise<void>;
}

/**
 ** Represents the NewUser component for creating a new user.
 * @param {NewUserProps} props - The props for the NewUser component.
 */
export default function NewUserUI({ handleCreateNewUser }: NewUserProps) {
  const userName = useRef<HTMLInputElement>(null);
  const userAccount = useRef<HTMLInputElement>(null);
  const userPass = useRef<HTMLInputElement>(null);
  const userForm = useRef<HTMLFormElement>(null);

  const handleAddEvent = () => {
    if (!userForm.current) return;
    userForm.current.reportValidity();
    if (!userForm.current.checkValidity()) return;
    handleCreateNewUser(userAccount, userName, userPass);
  };

  const handleCancelEvent = () => {
    if (!userName.current || !userAccount.current || !userPass.current) return;
    userName.current.value = '';
    userAccount.current.value = '';
    userPass.current.value = '';
  };

  return (
    <>
      <h1 className="font-humane text-9xl">NEW USER:</h1>
      <form onSubmit={event => { event.preventDefault(); }} className="flex w-full flex-wrap font-poppins font-bold" ref={userForm}>
        {/* Name Input */}
        <div className="w-1/3 px-2">
          <p>Name:</p>
          <input type="text" ref={userName} required className="w-full nm-inset-bg-sm rounded-lg p-2 font-normal" />
        </div>
        {/* User Input */}
        <div className="w-1/3 px-2">
          <p>User:</p>
          <input type="text" ref={userAccount} required className="w-full nm-inset-bg-sm rounded-lg p-2 font-normal" />
        </div>
        {/* Password Input */}
        <div className="w-1/3 px-2">
          <p>Password:</p>
          <input type="password" minLength={8} ref={userPass} required className="w-full nm-inset-bg-sm rounded-lg p-2 font-normal" />
        </div>
      </form>
      <div className="w-full flex flex-wrap mt-3 font-poppins font-bold">
        {/* Renders a NewUserButton component for adding and canceling a new user. */}
        <NewUserButtonUI label="Add" form handleEvent={handleAddEvent} />
        <NewUserButtonUI label="Cancel" handleEvent={handleCancelEvent} />
      </div>
    </>
  );
}
