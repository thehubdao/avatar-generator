import {useEffect, useState} from "react";
import {UserInterface} from "../../../interfaces/firebase.interface";
import {GetUserList} from "../../../utils/firebase.util";

export default function UserList() {
  const [userList, setUserList] = useState<UserInterface[]>();

  useEffect(() => {
    const componentDidMount = async () => {
      await getUserListData();
    };

    componentDidMount()
      .catch(err => console.error(err));
  }, []);

  async function getUserListData() {
    const userData = await GetUserList();
    setUserList(userData.success ? userData.value : []);
  }

  function renderUserList() {
    return userList == undefined ?
      <></> :
      userList.map(u =>
        <p key={'uKey_' + u.email}>{JSON.stringify(u)}</p>
      );
  }

  return (
    <>
      {renderUserList()}
    </>
  );
}