import Link from "next/link";
import { FaDiscord, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { TheHubSocialLinks } from "../../../enums/lukso/common.enum";

const socialMedia = [{
  alt: 'twitter icon',
  link: TheHubSocialLinks.Twitter,
  icon: <FaXTwitter size={25} />
}, {
  alt: 'instagram icon',
  link: TheHubSocialLinks.Instagram,
  icon: <FaInstagram size={25} />
}, {
  alt: 'discord icon',
  link: TheHubSocialLinks.Discord,
  icon: <FaDiscord size={25} />
}];

export default function SocialButtonsUI() {
  return (
    <div className="flex gap-3">
      {socialMedia.map((item, index) => {
        return <Link key={index} href={item.link} target="_blank">
          {item.icon}
        </Link>
      })}
    </div>
  );
}