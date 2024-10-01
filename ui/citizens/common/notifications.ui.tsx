import { useState } from "react";
import Button from "./button.ui";
import NotificationCard from "./notificationCard.ui";
import PlusSVG from "./SVG/plusSVG.ui";

const NOTIFICATIONS = [
  {
    title: 'Notification 01',
    points: 15,
    time: '5 mins',
    image: 'https://lipsum.app/id/1/280x300/'
  },
  {
    title: 'Notification 02',
    points: 15,
    time: '30 mins',
    image: 'https://lipsum.app/id/2/280x300/'
  },
  {
    title: 'Notification 03',
    points: 15,
    time: '5 mins',
    image: 'https://lipsum.app/id/3/280x300/'
  },
  {
    title: 'Notification 04',
    points: 15,
    time: '30 mins',
    image: 'https://lipsum.app/id/4/280x300/'
  },
  {
    title: 'Notification 05',
    points: 15,
    time: '5 mins',
    image: 'https://lipsum.app/id/5/280x300/'
  },
  {
    title: 'Notification 06',
    points: 15,
    time: '30 mins',
    image: 'https://lipsum.app/id/6/280x300/'
  },
  {
    title: 'Notification 07',
    points: 15,
    time: '5 mins',
    image: 'https://lipsum.app/id/7/280x300/'
  },
  {
    title: 'Notification 08',
    points: 15,
    time: '30 mins',
    image: 'https://lipsum.app/id/8/280x300/'
  }
]

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function deleteNotification(index: number) {
    const newNotifications = [...notifications];
    newNotifications.splice(index, 1);
    setNotifications(newNotifications);
  }

  return (
    <div className="fixed bottom-8 right-4">
      <Button label={`/// ${notifications.length > 0 ? `${notifications.length} more ` : 'no '}notifications`} handleClick={() => {setIsOpen(!isOpen)}} withIcon className="w-[376px]" textStiles="text-start pl-2">
        {isOpen ? <div className="w-[14px] h-[2px] bg-white" />:<PlusSVG />}
      </Button>
      {isOpen &&
        <div className="grid gap-3 pt-3 max-h-[276px] overflow-hidden">
          {
            notifications.map((el, i) => (
              <NotificationCard key={i} title={el.title} points={el.points} time={el.time} image={el.image} deleteSelf={() => deleteNotification(i)} />
            ))
          }
        </div>
      }
    </div>
  )
}