import { useRef } from "react";
import AGButton from "../../../common/ag-button.component";

//** Represents the props for the NewUser component.
interface NewUserProps {
  handleCreateNewUser: (
    userAccount: string,
    userName: string,
    userPass: string
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
    void handleCreateNewUser(userAccount.current?.value ?? '', userName.current?.value ?? '', userPass.current?.value ?? '');
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
          <p>User/Email:</p>
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
        <div className="w-1/2 px-2">
          <AGButton full form nm onClickEvent={() => { handleAddEvent(); }}>
            <p className="text-gray-normal py-1">Add</p>
          </AGButton>
        </div>
        <div className="w-1/2 px-2">
          <AGButton full nm onClickEvent={() => { handleCancelEvent(); }}>
            <p className="text-gray-normal py-1">Cancel</p>
          </AGButton>
        </div>
      </div>
    </>
  );
}
