import {Component, FormEvent} from "react";
import {UserRoleValues} from "../../../enums/firebase.enum";
import AGButton from "../../common/ag-button.component";
import AGText from "../../common/ag-text.component";
import {UserInterface} from "../../../interfaces/firebase.interface";
import {CreateNewUser, GetCurrentUser} from "../../../utils/firebase.util";

interface UserAddProps {
  creatorRole?: UserRoleValues;
}

export default class UserAdd extends Component<UserAddProps> {
  private userName: HTMLInputElement | null;
  private userAccount: HTMLInputElement | null;
  
  constructor(props: UserAddProps) {
    super(props);
    
    this.userName = null;
    this.userAccount = null;
  }
  
  render() {
    return (
      <>
        {this.props.creatorRole === UserRoleValues.superAdmin ?
          <>
            <AGText type="th1">New User</AGText>
            <form onSubmit={event => void this.createNewUser(event)}>
              <p>Nombre</p>
              <input type="text" ref={r => this.userName = r}/>
              <p>Usuario</p>
              <input type="text" ref={r => this.userAccount = r}/>
              <AGButton type="danger" form>Add</AGButton>
            </form>
          </>
          :
          <AGText type="th1">You can not create Users!</AGText>
        }
      </>
    );
  }

  private async createNewUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const newUser: Partial<UserInterface> = {
      name: this.userName?.value,
      email: this.userAccount?.value,
      role: UserRoleValues.admin,
    }
    
    await CreateNewUser(newUser);
    
    const currentUser = await GetCurrentUser();
    console.log(currentUser);
  }
}