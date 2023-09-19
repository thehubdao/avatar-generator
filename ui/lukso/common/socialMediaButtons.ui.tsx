import Link from "next/link";
import { FaDiscord, FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function SocialMediaButtonsLukso() {
  const socialMedia = [{
    alt: 'twitter icon',
    link: 'https://twitter.com/lukso_io',
    icon: <FaXTwitter size={25} />
  }, {
    alt: 'instagram icon',
    link: 'https://www.instagram.com/lukso/',
    icon: <FaInstagram size={25} />
  }, {
    alt: 'discord icon',
    link: 'https://discord.com/invite/lukso',
    icon: <FaDiscord size={25} />
  }]

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