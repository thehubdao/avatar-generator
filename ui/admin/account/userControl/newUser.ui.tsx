import { MutableRefObject, useRef } from "react";
import AGButton from "../../../common/ag-button.component";

//** Represents the props for the NewUserButton component.
interface NewUserButtonProps {
  label: string;
  handleEvent: () => void;
  form?: boolean;
}

//** Represents the props for the NewUser component.
interface NewUserProps {
  handleCreateNewUser: (
    userAccount: MutableRefObject<HTMLInputElement | null>,
    userName: MutableRefObject<HTMLInputElement | null>,
    userPass: MutableRefObject<HTMLInputElement | null>
  ) => Promise<void>;
}

/**
 ** Represents a button component for adding or canceling a new user.
 * @param {NewUserButtonProps} props - The props for the NewUserButton component.
 */
const NewUserButton = ({ label, handleEvent, form }: NewUserButtonProps) => {
  return (
    <div className="w-1/2">
      <AGButton full form={form} nm onClickEvent={() => { handleEvent(); }}>
        <p className="text-gray-normal py-1">{label}</p>
      </AGButton>
    </div>
  );
};

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
        <NewUserButton label="Add" form handleEvent={handleAddEvent} />
        <NewUserButton label="Cancel" handleEvent={handleCancelEvent} />
      </div>
    </>
  );
}
