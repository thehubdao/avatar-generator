import Button from "./common/button.ui";
import DetailsUI from "./common/details.ui";
import Notifications from "./common/notifications.ui";

export default function CitizensUI() {
  return (
    <>
      {/* nav */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-4">
        <Button label="backpack" withIcon handleClick={() => { }} />
        <Button label="collection" withIcon handleClick={() => { }} />
        <Button label="leaderboard" withIcon handleClick={() => { }} />
        <Button label="play" withIcon handleClick={() => { }} />
      </div>
      {/* details */}
      <DetailsUI />
      {/* notifications */}
      <Notifications />
    </>
  )
}