
import { UserRoleValues } from "../../../../enums/firebase.enum";
import { UserInterface } from "../../../../interfaces/firebase.interface";
import { _randomColors } from "../../../../utils/admin/colors.util";
import { RandomArrayElement } from "../../../../utils/common.util";

/**
 ** Represents a user card component.
 * @param {UserInterface} user - The user object to display.
 */
export default function UserCardUI({ user }: { user: UserInterface }) {

  return (
    <div className="nm-flat-bg w-72 p-5 rounded-xl whitespace-nowrap">
      <p className="truncate"><b>Name:</b> {user.name}</p>
      <p className="truncate"><b>Account:</b> {user.account}</p>
      <p className="truncate"><b>Email:</b> {user.email}</p>
      {user.campaign && user.campaign.length > 0 && <div className="truncate">
        <p><b>Campaigns:</b> {user.campaign.length}</p>
        <div className="overflow-x-auto flex gap-3">
          {user.campaign.map((item, index) => {
            return <p
              className={`${RandomArrayElement(_randomColors)} rounded-md px-2 py-1 my-1 text-bg text-sm`}
              key={index}>
              {item}
            </p>
          })}
        </div>
      </div>}
      <p className="truncate"><b>Role:</b> {UserRoleValues[user.role]} ({user.role})</p>
    </div>
  );
}