import {FormEvent, useRef} from "react";
import {AuthValues, UserRoleValues} from "../../../enums/firebase.enum";
import AGButton from "../../../ui/common/ag-button.component";
import AGText from "../../../ui/common/ag-text.component";
import {UserWithPass} from "../../../interfaces/firebase.interface";
import {CreateNewUser} from "../../../utils/firebase.util";
import {Delay, IsEmail, LogError} from "../../../utils/common.util";
import {AdminComponents, EmailResult, Module} from "../../../enums/common.enum";
import {ChangeComponentFunction} from "../../../interfaces/common.interface";
import { ShowModal } from "../../../utils/modal.util";

interface UserAddProps {
  changeComponent: ChangeComponentFunction;
}

export default function UserAdd({changeComponent}: UserAddProps) {
  const userName = useRef<HTMLInputElement>(null);
  const userAccount = useRef<HTMLInputElement>(null);
  const userPass = useRef<HTMLInputElement>(null);
  
  async function createNewUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newEmail = userEmail(userAccount?.current?.value);
    if(newEmail == undefined) return;
    
    const newUser: Partial<UserWithPass> = {
      account: userAccount?.current?.value,
      email: newEmail,
      name: userName?.current?.value,
      password: userPass?.current?.value,
      role: UserRoleValues.admin,
      campaign: [],
    };

    const result = await CreateNewUser(newUser);
    if (!result.success) {
      ShowModal(result.errMessage ?? 'No message');
    }
    else {
      ShowModal("User created successfully!");
      await Delay(2000);
      changeComponent(AdminComponents.UserList);
    }
  }

  function userEmail(account?: string) {
    if (account == undefined) return void LogError(Module.UserAdd, "Missing account!");

    switch (IsEmail(account)) {
      case EmailResult.NoEmail:
        return account + AuthValues.DefaultEmail;
      case EmailResult.GoodEmail:
        return account;
      case EmailResult.BadEmail:
        ShowModal("Wrong email, please insert a valid email or account");
        return void LogError(Module.UserAdd, "Wrong email, please insert a valid email or account");
    }
  }

  return (
    <>
      <AGText type="th1">New User</AGText>
      <form onSubmit={event => void createNewUser(event)}>
        <p>Name</p>
        <input type="text" ref={userName} required />
        <p>User</p>
        <input type="text" ref={userName} required />
        <p>Password</p>
        <input type="password" ref={userPass} minLength={8} />
        <AGButton type="danger" form>Add</AGButton>
      </form>
      <AGButton type="alert">Cancel</AGButton>
    </>
  );
}