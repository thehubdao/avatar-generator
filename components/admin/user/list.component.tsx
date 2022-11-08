import {Component} from "react";
import {ChangeComponentFunction} from "../../../interfaces/common.interface";
import {UserInterface} from "../../../interfaces/firebase.interface";
import {GetUserList} from "../../../utils/firebase.util";

interface UserListProps {
  changeComponent: ChangeComponentFunction;
}

interface UserListState {
  userList: UserInterface[];
}

export default class UserList extends Component<UserListProps, UserListState> {
  async componentDidMount() {
    await this.getUserListData();
  }

  private async getUserListData() {
    const userData = await GetUserList();
    
    this.setState({
      userList: userData ?? []
    });
  }

  render() {
    return (
      <>
        {this.renderUserList()}
      </>
    );
  }

  private renderUserList() {
    return this.state?.userList.map(u => <p>{JSON.stringify(u)}</p>)
  }
}