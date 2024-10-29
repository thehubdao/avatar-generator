import { useEffect, useState } from "react";
import Button from "./button.ui";
import NotificationCard from "./notificationCard.ui";
import PlusSVG from "./SVG/plusSVG.ui";
import { GetUserNotifications, DeleteUserNotification } from "../../../utils/firebase.util";
import { Notification } from "../../../types/firebase.type";

function FormatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return 'just now';
  if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins} ${mins === 1 ? 'min' : 'mins'}`;
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  if (diff < month) {
    const days = Math.floor(diff / day);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  if (diff < year) {
    const months = Math.floor(diff / month);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  const years = Math.floor(diff / year);
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}

export default function Notifications({address}: {address: string}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchNotifications() {
      if (address) {
        const fetchedNotifications = await GetUserNotifications(address);
        
        // Aplicar el formato de tiempo relativo a cada notificación
        const formattedNotifications = fetchedNotifications.map(notification => ({
          ...notification,
          time: FormatRelativeTime(notification.time)
        }));

        setNotifications(formattedNotifications);
      }
    }

    fetchNotifications();
  }, [address]);

  async function deleteNotification(index: number) {
    const notificationToDelete = notifications[index];
    
    if (notificationToDelete.id) {
      try {
        await DeleteUserNotification(address, notificationToDelete.id);
        const newNotifications = notifications.filter((_, i) => i !== index);
        setNotifications(newNotifications);
      } catch (error) {
        console.error("Error deleting notification:", error);
        // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
      }
    } else {
      console.error("Notification doesn't have an ID");
    }
  }

  return (
    <div className="fixed bottom-4 right-4">
      <Button label={`/// ${notifications.length > 0 ? `${notifications.length} ` : 'no '}notifications`} handleClick={() => {setIsOpen(!isOpen)}} withIcon className="w-[376px]" textStiles="text-start pl-2">
        {isOpen ? <div className="w-[14px] h-[2px] bg-white" />:<PlusSVG />}
      </Button>
      {isOpen &&
        <div className="grid gap-3 pt-3 max-h-[276px] overflow-hidden">
          {
            notifications.map((el, i) => (
              <NotificationCard key={i} title={el.title} points={el.points} time={el.time} deleteSelf={() => deleteNotification(i)} />
            ))
          }
        </div>
      }
    </div>
  )
}